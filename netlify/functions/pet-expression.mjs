/* Optional, opt-in cloud image generation for newly uploaded pets.
 * No user's pet image leaves the browser unless they agree. A site owner must
 * configure GEMINI_API_KEY in Netlify environment variables to enable this.
 * This demo endpoint has no user auth/quota controls: do not expose publicly
 * with a billing API key before adding authorization and rate limits.
 */
const PROMPTS={
 happy:'Joyful, bright attentive eyes, natural open-mouthed smile only if appropriate for this specific animal; energetic but not cartoonish.',
 calm:'Calm, natural relaxed expression. Neutral eyes and gently closed or relaxed mouth; not an exaggerated smile.',
 soft:'Subdued and slightly tired expression. Gently lowered ears if anatomically possible, more relaxed eyelids, mouth closed. No smile.',
 sad:'Clearly subdued, tired expression with naturally lowered ears if possible, slightly drooping eyelids, mouth completely closed and neutral-downturned. No smile, no tongue.'
};
const ok=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async (request)=>{
 if(request.method!=='POST')return ok({error:'POST required'},405);
 const key=process.env.GEMINI_API_KEY;
 if(!key)return ok({error:'AI image generation is not configured'},503);
 // These checks are not a substitute for production authentication and billing limits.
 const length=Number(request.headers.get('content-length')||0);
 if(length>2500000)return ok({error:'Image too large'},413);
 try{
  const {image,grade,species}=await request.json();
  if(typeof image!=='string'||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>2400000)return ok({error:'Invalid uploaded image'},400);
  if(!Object.hasOwn(PROMPTS,grade))return ok({error:'Unsupported grade'},400);
  const mime=image.slice(5,image.indexOf(';')),data=image.slice(image.indexOf(',')+1);
  const subject=species==='cat'?'cat':'dog';
  const prompt=`Photorealistic identity-preserving EDIT of the exact same ${subject} in the provided photo. Maintain its individual appearance: exact fur colors and markings, anatomy, facial proportions, eye color, nose, pose, background lighting and camera angle. Change ONLY the facial expression to this precise target: ${PROMPTS[grade]} Make ONE clean high-fidelity vertical portrait, no text, no stickers, no frames, no additional animals. Absolutely no duplicated eyes, mouth, tongue, nose or muzzle; no cloned or ghosted fur, blurry lower jaw, visible retouching, extra limbs or distorted face. The original pet MUST remain recognizably the same individual. Keep the background visually consistent.`;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),55000);
  let upstream;
  try{upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent`,{
   method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},signal:controller.signal,
   body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inlineData:{mimeType:mime,data}}]}],generationConfig:{responseModalities:['TEXT','IMAGE']}})
  })}finally{clearTimeout(timer)}
  if(!upstream.ok){const detail=(await upstream.text()).slice(0,500);console.error('Gemini image error',upstream.status,detail);return ok({error:'Image generation provider returned an error'},502)}
  const payload=await upstream.json();const parts=payload?.candidates?.[0]?.content?.parts||[];
  const part=parts.find(p=>p.inlineData&&p.inlineData.data&&p.inlineData.mimeType?.startsWith('image/'));
  if(!part)return ok({error:'No generated image returned'},502);
  const full=`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  if(full.length>5800000)return ok({error:'Generated image exceeds response limit'},502);
  return ok({image:full});
 }catch(err){console.error('Generate expression error',err?.message);return ok({error:'Image generation failed or timed out'},502)}
};
