/* DeepPet V10.129: concise four-tab clarity / locale polish.
 * No simulated data, scoring coefficients, histories, alerts thresholds or
 * physical device workflows are altered. Preserve all user actions.
 */
(function(root){'use strict';
  const lex={
   zht:{advice:'日常照護重點',eyebrow:'依寵物資料整理',intro:'依照品種、年齡、體重和健康紀錄，整理現在值得注意的事。', priorities:'目前值得留意', more:'查看全部',hrvTitle:'HRV 是什麼？',hrvHelp:'HRV 看的是每次心跳間隔的自然變化。比平常低，可能和疲累、緊張或剛運動有關；要在相似的休息狀態下比較，並搭配精神、呼吸和睡眠觀察。不能單靠 HRV 判斷情緒或疾病。'},
   zh:{advice:'日常照护重点',eyebrow:'根据宠物资料整理',intro:'根据品种、年龄、体重和健康记录，整理现在值得注意的事。',priorities:'目前值得留意',more:'查看全部',hrvTitle:'HRV 是什么？',hrvHelp:'HRV 看的是每次心跳间隔的自然变化。比平常低，可能和疲劳、紧张或刚运动有关；要在相似的休息状态下比较，并结合精神、呼吸和睡眠观察。不能只靠 HRV 判断情绪或疾病。'},
   en:{advice:'Everyday care priorities',eyebrow:'Based on your pet’s profile',intro:'Key things to watch based on breed, age, weight and health records.',priorities:'What matters now',more:'View all',hrvTitle:'What does HRV mean?',hrvHelp:'HRV describes natural changes between heartbeats. Lower than usual may relate to tiredness, stress or recent exercise. Compare similar resting periods and check breathing, sleep and behavior too. HRV alone cannot diagnose illness or emotions.'},
   ja:{advice:'日々の健康チェック',eyebrow:'ペットの情報をもとに',intro:'品種・年齢・体重・健康記録から、今気をつけたい点をまとめました。',priorities:'今、気をつけたいこと',more:'すべて見る',hrvTitle:'HRV とは？',hrvHelp:'HRV は心拍の間隔の自然な変化です。普段より低い場合、疲れ・緊張・運動の影響も考えられます。同じように休んでいる時の値と比べ、呼吸や睡眠、様子も確認してください。HRV だけでは病気や気持ちは判断できません。'},
   ko:{advice:'일상 건강 관리',eyebrow:'반려동물 정보 기준',intro:'품종·나이·체중·건강 기록으로 지금 살펴볼 부분을 정리했습니다.',priorities:'지금 확인할 점',more:'전체 보기',hrvTitle:'HRV란 무엇인가요?',hrvHelp:'HRV는 심장 박동 간격의 자연스러운 변화입니다. 평소보다 낮으면 피로·긴장·운동의 영향일 수 있습니다. 비슷하게 쉬는 시간끼리 비교하고 호흡·수면·행동도 확인하세요. HRV만으로 감정이나 질병을 판단할 수 없습니다.'}
  };
  // Complete several common characters missing from the legacy Simplified map.
  try{if(typeof SIMPLIFY_MAP==='object')Object.assign(SIMPLIFY_MAP,{
    '極':'极','脫':'脱','齦':'龈','膚':'肤','蟲':'虫','臨':'临','療':'疗','審':'审','檔':'档','進':'进','詢':'询','頸':'颈','徑':'径','訊':'讯','頓':'顿','趨':'趋','態':'态','應':'应','鬆':'松','嶄':'崭','慮':'虑','靜':'静','優':'优','劃':'划','擇':'择','載':'载','複':'复','異':'异','緊':'紧','聲':'声','無':'无','觸':'触','隨':'随','轉':'转','顯':'显','勢':'势','錄':'录','際':'际','緩':'缓','醫':'医','觀':'观','獨':'独','遠':'远','續':'续'
  });}catch(_){/* keep existing locale data */}
  const jaTranslations=[
   ['Add pet','ペットを追加'],['Next medication','次の投薬'],['Tomorrow','明日'],
   ['No paired device','接続済みの首輪なし'],['Edit profile','プロフィールを編集'],['Change photo','写真を変更'],
   ['Built from the latest 14 valid recording days','直近14日間の有効な記録から作成'],
   ['Heart Moments','心拍の瞬間'],['Capture a keepsake of this pet’s heartbeat','この子の心拍を記念に残す'],
   ['My device','マイデバイス'],['No collar paired','首輪は未接続'],['Search nearby and pair a collar','近くの首輪を探して接続'],['Not paired','未接続'],
   ['DeepPet Store','DeepPet ショップ'],['Shop now','商品を見る'],
   ['Explore health collars, models and service plans','首輪の種類と料金プランを見る'],
   ['Open','開く']
  ];
  function localizeVisible(){
   if(state.lang==='zh'){
    const rootEl=document.querySelector('#app');
    if(rootEl){const walker=document.createTreeWalker(rootEl,NodeFilter.SHOW_TEXT);let node;
     while((node=walker.nextNode()))if(node.parentElement&&!node.parentElement.closest('script,style,svg')){
      node.nodeValue=node.nodeValue.replace(/纪录/g,'记录').replace(/搜寻/g,'搜索');
     }
    }
    return;
   }
   if(state.lang!=='ja')return;
   for(const rootEl of [document.querySelector('#app'),document.querySelector('#overlay-root')]){
    if(!rootEl)continue;
    const walker=document.createTreeWalker(rootEl,NodeFilter.SHOW_TEXT);
    let n;while((n=walker.nextNode())){
     if(!n.parentElement||n.parentElement.closest('script,style,svg,option'))continue;
     let text=n.nodeValue,newText=text;
     for(const [a,b] of jaTranslations){
      if(newText.includes(a))newText=newText.split(a).join(b);
     }
     if(newText!==text)n.nodeValue=newText;
    }
   }
  }
  function compactDeepReference(){
   if(state.tab!=='deep'||state.detail)return;
   const scope=document.querySelector('#app .dp-owner-deep');if(!scope)return;
   const l=lex[state.lang]||lex.zht;
   for(const old of scope.querySelectorAll('.dp909-brief')){
    if(!old.textContent.includes('RMSSD')||!old.textContent.includes('SDNN'))continue;
    const details=document.createElement('details');details.className='dp129-hrv-details';
    const heading=document.createElement('summary');heading.textContent=l.hrvTitle;
    const p=document.createElement('p');p.textContent=l.hrvHelp;
    details.append(heading,p);old.replaceWith(details);
   }
   // Energy and recovery previously left TWO technical essays expanded under
   // the cards even for a healthy pet. Replace with a single optional hint.
   if((Number(state.deepType)||0)===2){
    const oldNotes=[...scope.querySelectorAll('.dp909-brief')];
    // V10.139 UI refinement: the additional "How to read energy & recovery?"
   // accordion is redundant with the visible causes and advice. Do not
   // replace the old technical essay with another accordion or blank spacer.
   oldNotes.forEach(x=>x.remove());
   scope.querySelectorAll('.dp129-energy-help').forEach(x=>x.remove());
    // Japanese wraps one moderate-recovery note one line past its limit.
    // Preserve the measured cause and risk tier; avoid repeating the action.
    if(state.lang==='ja'&&[7,30].includes(Number(state.range))){
     for(const card of scope.querySelectorAll('.dp127-compact[data-dp127-max="5"]')){
      if(!card.textContent.includes('活動後の回復'))continue;
      const p=card.querySelector('p[data-dp127-role="action"]');if(p)p.remove();
     }
    }
   }
   // The overview already carries the urgent action. The other cards should
   // say WHAT went wrong rather than repeating the same long action 4 times.
   const category=Number(state.deepType)||0;
   if(category===0){
    for(const box of scope.querySelectorAll('.dp903-metric-card .dp127-compact')){
     const action=box.querySelector('p[data-dp127-role="action"]');
     if(action)action.remove();
    }
   }
   // Re-measure the actual visible lines after compacting (rather than
   // leaving the stale pre-compaction line count in the element metadata).
   for(const el of scope.querySelectorAll('.dp127-compact')){
    let count=0;
    for(const p of el.querySelectorAll(':scope > p')){
     const cs=getComputedStyle(p),line=parseFloat(cs.lineHeight);
     if(line>0)count+=Math.max(1,Math.ceil((p.getBoundingClientRect().height-0.5)/line));
    }
    el.dataset.dp127Measured=String(count);
   }
  }
  function tidyHealth(){
   if(state.tab!=='health'||state.detail)return;
   const page=document.querySelector('#app .dp1075-health-page');if(!page)return;
   const l=lex[state.lang]||lex.zht;
   const card=page.querySelector('.dp941-prevention');
   if(card){
    const eyebrow=card.querySelector('.dp941-prevention-heading small');if(eyebrow)eyebrow.textContent=l.eyebrow;
    const title=card.querySelector('.dp941-prevention-heading h2');if(title)title.textContent=l.advice;
    const intro=card.querySelector('.dp1041-prevention-intro');if(intro)intro.textContent=l.intro;
    const priorities=card.querySelector(':scope > h3');if(priorities)priorities.textContent=l.priorities;
   }
   // Keep the 9-item menu in the owner-specified order. No links are removed.
   const list=page.querySelector('.dp1063-care-list');
   if(list){const vet=list.querySelector(':scope > .vet');if(vet)list.append(vet);}
  }
  function tidyMe(){
   if(state.tab!=='me'||state.detail)return;
   const pet=currentDog();
   if(!pet||(!pet.dpFreshPet&&!pet.freeCare&&!pet.dpOwnerReal))return;
   // An entirely unmonitored profile has ZERO valid days, not "N/A days".
   // This is a count label only; scores themselves remain N/A.
   const card=document.querySelector('#app .dp70-baseline-hero');
   const label=card?.querySelector('.grow > small');
   if(label&&/N\/A/.test(label.textContent)){
    const words={zht:'正在建立健康基準 · 尚無有效記錄',zh:'正在建立健康基准 · 暂无有效记录',
      en:'Setting up baseline · No valid readings yet',ja:'健康基準を作成中 · 有効な記録はまだありません',
      ko:'건강 기준 생성 중 · 유효한 기록 없음'};
    label.textContent=words[state.lang]||words.zht;
   }
  }
  function finish(){
   try{compactDeepReference();tidyHealth();tidyMe();localizeVisible();
     root.DeepPetBuildVersion='10.204';
     document.querySelectorAll('#app .app-build-version').forEach(el=>{
      el.textContent=el.textContent.replace(/10\.12[0-9]/g,'10.130');
     });
   }catch(e){console.warn('DeepPet clarity update:',e);}
  }
  const previous=render;
  render=function(...args){const v=previous.apply(this,args);finish();return v;};
  root.DeepPetClarity129=Object.freeze({version:'10.129',finish});
  if(document.querySelector('#app .app-main')){
   // If the active language is Simplified Chinese, apply new mapping to fresh
   // source strings through the existing full render path; not a text hack.
   if(state.lang==='zh')render(false);else finish();
  }
})(window);
