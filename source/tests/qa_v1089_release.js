/* DeepPet V10.101 — persistent social transactions and owner-text integrity. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const app=read('assets/js/app_03.js');
const section=(start,end)=>{const a=app.indexOf(start),b=app.indexOf(end,a);assert(a>=0&&b>a,start);return app.slice(a,b);};
assert.equal(read('VERSION.txt').trim(),'DeepPet V10.101');
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.js/);
assert.match(read('index.html'),/deeppet-v10101-[a-f0-9]{12}\.css/);

let writable=false,saves=0,successes=0;
const state={dog:0,dpSocial:{friendIds:{},requests:[]},gardenMessagesByPet:{},dpPetEpoch:1,chatWith:'luna',chatPerspective:'me'};
const env={state,JSON,Number,Date,
 persist:()=>{saves++;return writable;},
 dpSocialState:()=>state.dpSocial,dpCurrentPetId:()=>`DP-${state.dog===0?'210001':'210002'}`,
 dpPetFromPublicId:id=>id==='DP-210002'?{index:1,publicId:id,name:'Luna'}:null,
 dpAreFriends:()=>false,dpRequestBetween:()=>null,dpSecureId:()=>`DP-${String(saves).padStart(16,'0')}`,
 label3:s=>s,toast:()=>{successes++;}
};
vm.createContext(env);
vm.runInContext(section('function dpRootCommit(', 'function dpGpsCommit('),env);
vm.runInContext(section('function dpFriendSend(', 'function dpPublicPetData('),env);

assert.equal(env.dpFriendSend('DP-210002'),false,'quota failure must not claim friendship request sent');
assert.equal(state.dpSocial.requests.length,0,'unsaved request must be rolled back');
assert.equal(successes,0,'no success toast before commit');
writable=true;
assert.equal(env.dpFriendSend('DP-210002'),true);
assert.equal(state.dpSocial.requests.length,1);
assert.equal(successes,1);
const requestId=state.dpSocial.requests[0].id;
state.dog=1;
writable=false;
assert.equal(env.dpFriendAnswer(requestId,true),false);
assert.equal(state.dpSocial.requests[0].status,'pending');
assert.deepEqual(JSON.parse(JSON.stringify(state.dpSocial.friendIds)),{});
writable=true;
assert.equal(env.dpFriendAnswer(requestId,true),true);
assert.equal(state.dpSocial.requests[0].status,'accepted');
assert.deepEqual(JSON.parse(JSON.stringify(state.dpSocial.friendIds['DP-210001'])),['DP-210002']);
assert.deepEqual(JSON.parse(JSON.stringify(state.dpSocial.friendIds['DP-210002'])),['DP-210001']);

// A failed send must leave BOTH pet inboxes as they were, including media.
state.dog=0;
let renders=0;
Object.assign(env,{
 dpFriendAuthorizedForThread:()=>true,
 dpChatList:id=>{const owner=String(state.dog);state.gardenMessagesByPet[owner]??={};return state.gardenMessagesByPet[owner][id]??=[];},
 dpChatClock:()=>'09:32',iso:()=>'2026-11-18',localDate:()=>new Date('2026-11-18T12:00:00'),
 dpPetFromChatKey:()=>({index:1,publicId:'DP-210002'}),
 dpPetDirectory:()=>[{index:0,publicId:'DP-210001'},{index:1,publicId:'DP-210002'}],
 dpChatKeyForPet:()=> 'milo',
 dpAreFriends:()=>true,
 document:{getElementById:()=>({value:'guardian message'})},
 render:()=>{renders++;}
});
vm.runInContext(section('function dpChatAddMessage(', 'function dpChatBubbleContent('),env);
const before=JSON.stringify(state.gardenMessagesByPet);
writable=false;
env.dpChatAddMessage('text','Hello Luna');
assert.equal(JSON.stringify(state.gardenMessagesByPet),before,'failed message must roll back both owners');
assert.equal(renders,0,'do not redraw a message that was not saved');
writable=true;
env.dpChatAddMessage('text','Hello Luna');
assert.equal(state.gardenMessagesByPet['0'].luna[0].text,'Hello Luna');
assert.equal(state.gardenMessagesByPet['1'].milo[0].text,'Hello Luna');
assert.equal(state.gardenMessagesByPet['1'].milo[0].from,'other');
assert.equal(renders,1);
const saved=JSON.stringify(state.gardenMessagesByPet);
writable=false;
env.dpChatAddMessage('image','data:image/jpeg;base64,YWJj');
assert.equal(JSON.stringify(state.gardenMessagesByPet),saved,'unsaved media must not remain in either inbox');
vm.runInContext(section('function dpMarkThreadRead(', 'function dpOpenChat('),env);
assert.equal(env.dpMarkThreadRead('luna'),false);
assert.equal(JSON.stringify(state.gardenMessagesByPet),saved,'read-state rollback must preserve notifications');

// The presentation cleanup is allowed to strip static labels, never the
// guardian's pet names, chat text or care notes that happen to say "Demo".
let nextText='Demo';
const textNode={nodeType:3,nodeValue:'',parentElement:{matches:()=>false}};
const rootNode={nodeType:1,isConnected:true,attrs:{alt:'Demo'},matches:()=>false,
 hasAttribute(key){return Object.hasOwn(this.attrs,key);},getAttribute(key){return this.attrs[key];},setAttribute(key,value){this.attrs[key]=value;}};
const ui={window:{},state:{petExtras:[{name:'Demo'}],notesByDog:{'15':[{text:'My example medicine'}]}},dogs:[],
 document:{body:null,querySelector:key=>key==='#app'?rootNode:null,
  createTreeWalker:()=>{let called=false;return {nextNode:()=>called?null:(called=true,textNode)};}},
 NodeFilter:{SHOW_ELEMENT:1,SHOW_TEXT:4},render:()=>{textNode.nodeValue=nextText;},
 renderModal:()=>{},toast:()=>{}};
vm.createContext(ui);
vm.runInContext(read('assets/js/ux_v1087.js'),ui);
ui.render();
assert.equal(textNode.nodeValue,'Demo');
assert.equal(rootNode.attrs.alt,'Demo');
nextText='My example medicine';ui.render();
assert.equal(textNode.nodeValue,'My example medicine');
nextText='模拟 GPS';ui.render();
assert.equal(textNode.nodeValue,'GPS','static explanatory label should still be cleaned');

// HTML src attributes now consistently escape photo fields that can come
// from user-owned profiles, including both avatars inside a conversation.
assert.doesNotMatch(app,/src="\$\{(?:d\.photo|p\.photo|found\.photo|incomingPhoto|outgoingPhoto|p\?\.photo\|\|dogs\[0\]\.photo)\}"/);
for(const phrase of ['src="${esc(d.photo)}"','src="${esc(p.photo)}"','src="${esc(found.photo)}"',
 'src="${esc(incomingPhoto)}"','src="${esc(outgoingPhoto)}"','src="${esc(photo)}"'])assert(app.includes(phrase),phrase);

console.log('PASS V10.93: friend-request rollback, two-inbox atomic messages, saved owner text and safe portrait attributes');
