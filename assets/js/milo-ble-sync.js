/* DeepPet V10.130 · Milo owner-only near-field Bluetooth capture.
   Validated B0 packets update only the two live readings in Deep.
   Full-day wellness scores and history MUST NOT be inferred from this stream.
   A connected GATT device alone is not verified telemetry. */
(function(root){'use strict';
 const STORAGE_SCOPE=0, SVC=0xfff0, RX=0xffe1, TX=0xffe2;
 let device=null, server=null, notify=null, writer=null, connecting=false, connected=false, frames=[], valid=0, sessionValid=0, bad=0, chunks=[], last=null, started=null, activeId=null;
 const L=(z,s,e,j,k)=>({zht:z,zh:s,en:e,ja:j,ko:k})[state.lang]||z;
 const text={
  title:()=>L('藍牙項圈同步','蓝牙项圈同步','Bluetooth collar sync','Bluetooth首輪の同期','블루투스 목걸이 동기화'),
  btn:()=>L('同步','同步','Sync','同期','동기화'),
  export:()=>L('匯出本次紀錄','导出本次记录','Export session','今回の記録を保存','이번 기록 내보내기'),
  idle:()=>L('尚未連接項圈','尚未连接项圈','Collar not connected','首輪は未接続です','목걸이가 연결되지 않았습니다'),
  connecting:()=>L('正在連接附近項圈…','正在连接附近项圈…','Connecting to nearby collar…','近くの首輪に接続中…','근처 목걸이 연결 중…'),
  waiting:()=>L('已連接，等待有效量測資料','已连接，等待有效测量数据','Connected; waiting for verified readings','接続済み。有効な測定データを待っています','연결됨. 유효한 측정 데이터를 기다리는 중'),
  receiving:()=>L('正在接收項圈實測資料','正在接收项圈实测数据','Receiving collar measurements','首輪からの測定値を受信中','목걸이 측정값 수신 중'),
  missing:()=>L('目前只有心率／呼吸可核對；睡眠、HRV與每日分數仍待完整資料。','目前只能核对心率／呼吸；睡眠、HRV和每日分数仍需完整数据。','Only heart and breathing are verified here; sleep, HRV and daily scores need more evidence.','確認できるのは心拍・呼吸のみ。睡眠・HRV・日次スコアには追加データが必要です。','현재 심박·호흡만 확인됩니다. 수면·HRV·일일 점수에는 추가 데이터가 필요합니다.'),
  requirements:()=>L('請用 Android Chrome 開啟 HTTPS 網站，靠近項圈並先退出原廠 Pet Health。','请用 Android Chrome 打开 HTTPS 网站，靠近项圈并先退出原厂 Pet Health。','Use Android Chrome on HTTPS, stay near the collar and close Pet Health first.','Android版ChromeのHTTPS画面を使用し、首輪に近づきPet Healthを終了してください。','Android Chrome의 HTTPS 사이트에서 목걸이 근처로 이동한 후 Pet Health를 종료하세요.'),
  unsupported:()=>L('此瀏覽器無法使用藍牙。請改用 Android Chrome + HTTPS。','此浏览器无法使用蓝牙。请改用 Android Chrome + HTTPS。','Bluetooth unavailable. Use Android Chrome over HTTPS.','Bluetoothに非対応です。Android ChromeのHTTPSページをご利用ください。','블루투스를 사용할 수 없습니다. Android Chrome과 HTTPS를 사용하세요.'),
  nolog:()=>L('目前沒有收到可匯出的有效封包','目前没有可导出的有效数据包','No valid data packets to export yet','保存できる有効なパケットがありません','내보낼 유효한 패킷이 없습니다'),
  failed:()=>L('連線或同步未成功，請檢查藍牙、裝置電量與距離。','连接或同步未成功，请检查蓝牙、设备电量与距离。','Connection or sync failed. Check Bluetooth, battery and distance.','接続・同期に失敗しました。Bluetooth・電池・距離をご確認ください。','연결 또는 동기화 실패. 블루투스·배터리·거리를 확인하세요.'),
  labelHeart:()=>L('即時心率','实时心率','Live heart rate','現在の心拍','실시간 심박'),
  labelBreath:()=>L('即時呼吸','实时呼吸','Live breathing','現在の呼吸','실시간 호흡'),
  count:()=>L('有效封包','有效数据包','Valid packets','有効パケット','유효 패킷'),
 };
 const selected=()=>!state.emptyPreview&&state.dog===STORAGE_SCOPE;
 const status=()=>connecting?text.connecting():connected?(sessionValid?text.receiving():text.waiting()):text.idle();
 function block(){return `<section class="card dp130-sync" id="dp130-milo-sync"><div class="dp130-top"><strong>${text.title()}</strong><span class="dp130-indicator ${(connected&&sessionValid)?'is-data':connected?'is-connected':''}" id="dp130-sync-status">${status()}</span></div><div class="dp130-readings"><div><small>${text.labelHeart()}</small><b id="dp130-hr">${connected&&sessionValid?last?.hr||'—':'—'}</b><span>bpm</span></div><div><small>${text.labelBreath()}</small><b id="dp130-rr">${connected&&sessionValid?last?.rr||'—':'—'}</b><span>/min</span></div><div><small>${text.count()}</small><b id="dp130-count">${valid}</b></div></div><p class="dp130-note">${valid?text.missing():text.requirements()}</p><div class="dp130-actions"><button type="button" class="dp130-sync-btn" data-action="dp130-sync">${text.btn()}</button><button type="button" class="dp130-export-btn" data-action="dp130-export" ${!valid?'disabled':''}>${text.export()}</button></div></section>`;}
 const oldRender=render;
 render=function(...args){const value=oldRender.apply(this,args);if(selected()&&state.tab==='deep'&&!state.detail){const main=document.querySelector('#main-scroll');if(main&&!main.querySelector('#dp130-milo-sync')){const pad=main.querySelector('.app-pad')||main;const anchor=pad.querySelector('.deep-day-picker')||pad.querySelector('.segment')||pad.querySelector('.tabs')||pad.querySelector('.view-header');if(anchor)anchor.insertAdjacentHTML('afterend',block());else pad.insertAdjacentHTML('afterbegin',block());}}return value;};
 function refresh(){const card=document.getElementById('dp130-milo-sync');if(!card)return;const statusEl=card.querySelector('#dp130-sync-status');if(statusEl){statusEl.textContent=status();statusEl.className='dp130-indicator '+((connected&&sessionValid)?'is-data':connected?'is-connected':'');}card.querySelector('#dp130-hr').textContent=connected&&sessionValid?last?.hr||'—':'—';card.querySelector('#dp130-rr').textContent=connected&&sessionValid?last?.rr||'—':'—';card.querySelector('#dp130-count').textContent=String(valid);card.querySelector('.dp130-note').textContent=valid?text.missing():text.requirements();card.querySelector('[data-action="dp130-export"]').disabled=!valid;}
 function crc(data,start=2,end=data.length-2){let crc=0;for(let i=start;i<end;i++){crc^=(data[i]<<8);for(let j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021)&0xffff:(crc<<1)&0xffff;}return crc;}
 function packet(command,payload=[]){const arr=Uint8Array.from([0xfe,0xef,command,payload.length,...payload]);const c=crc(arr,2,arr.length);return Uint8Array.from([...arr,c>>8,c&255]);}
 function parse(bytes,at){chunks.push(...bytes);if(chunks.length>10000)chunks=chunks.slice(-1000);let parsed=0;while(chunks.length>=6){const start=chunks.indexOf(0xfe);if(start<0){chunks=[];break;}if(start>0)chunks.splice(0,start);if(chunks.length<6)break;if(chunks[1]!==0xef){chunks.shift();continue;}const len=chunks[3]+6;if(len<6||len>260){chunks.shift();bad++;continue;}if(chunks.length<len)break;const f=Uint8Array.from(chunks.splice(0,len));if((((f[len-2]<<8)|f[len-1])!==crc(f))){bad++;continue;}if(f[2]!==0xb0||len!==92)continue;const hr=f[4],rr=f[5];
   // A CRC-valid zero-channel frame is a signal event, NOT a measured 0/100
   // nor proof of cardiac/respiratory arrest. Movement byte is not validated.
   try{root.dispatchEvent(new CustomEvent('dp132-reading',{detail:{at:new Date(at).toISOString(),hr,rr,motion:null,
    heartPresent:hr>0,breathPresent:rr>0,motionPresent:false,quality:true}}));}catch(_){}
   if(hr<1||hr>240||rr<1||rr>120){bad++;continue;}const row={at:new Date(at).toISOString(),hr,rr,flags:[...f.slice(6,9)],waveA:[...f.slice(23,43)],waveB:[...f.slice(43,63)]};last=row;valid++;sessionValid++;parsed++;if(frames.length<18000)frames.push(row);}if(parsed)refresh();return parsed;}
 async function write(command,payload=[]){if(!writer)return;const bytes=packet(command,payload);if(writer.properties.writeWithoutResponse&&writer.writeValueWithoutResponse)await writer.writeValueWithoutResponse(bytes);else await writer.writeValue(bytes);}
 function disconnect(){try{device?.gatt?.disconnect();}catch{}connected=false;connecting=false;notify=null;writer=null;server=null;refresh();}
 async function sync(){if(connecting)return;if(!selected())return; if(!root.isSecureContext||!navigator.bluetooth?.requestDevice){alert(text.unsupported());return;}
  if(connected&&device?.gatt?.connected){refresh();return;}
  connecting=true;refresh();let picked=null;
  try{
   // Request is the first awaited operation, preserving the user gesture.
   picked=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:[SVC]});
   if(!selected())throw Error('pet_changed');device=picked;activeId=picked.id;sessionValid=0;last=null;device.addEventListener('gattserverdisconnected',()=>{connected=false;connecting=false;refresh();});
   server=await device.gatt.connect();const service=await server.getPrimaryService(SVC);
   notify=await service.getCharacteristic(RX);writer=await service.getCharacteristic(TX);
   await notify.startNotifications();notify.addEventListener('characteristicvaluechanged',ev=>{if(!selected()||activeId!==device?.id)return;const view=ev.target?.value;if(!view)return;parse(new Uint8Array(view.buffer,view.byteOffset,view.byteLength),Date.now());});
   connected=true;connecting=false;started=new Date().toISOString();chunks=[];refresh();
   const epoch=Math.floor(Date.now()/1000);const data=[(epoch>>>24)&255,(epoch>>>16)&255,(epoch>>>8)&255,epoch&255,1];
   try{await write(0x40,data);setTimeout(()=>{if(device?.gatt?.connected&&selected())write(0x20).catch(()=>{});},600);}catch(err){console.warn('BLE subscription active, initialization command not confirmed',err);}
  }catch(err){console.warn('DeepPet Milo BLE',err);disconnect();if(err?.name!=='NotFoundError')alert(text.failed());}
 }
 function exportCapture(){if(!frames.length){alert(text.nolog());return;}const payload={schema:'deeppet-milo-ble-capture-v1',pet:'Milo',ageYears:6,weightKg:55,mode:'Bluetooth',source:'observed-ffe1-crc16-b0',readingsOnly:true,fullDailyScoresVerified:false,startedAt:started,exportedAt:new Date().toISOString(),validFrames:valid,badFrames:bad,deviceId:activeId||null,records:frames};const blob=new Blob([JSON.stringify(payload)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Milo_BLE_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 document.addEventListener('click',event=>{const action=event.target?.closest?.('[data-action]')?.dataset?.action;if(action==='dp130-sync'||action==='dp130-export'){event.preventDefault();event.stopImmediatePropagation();if(action==='dp130-sync')sync();else exportCapture();}},true);
 root.DeepPetMiloBLE130=Object.freeze({version:'10.130',parsePacketBytes:parse,crc16:(b)=>crc(b,2,b.length-2),status:()=>({connected,connecting,valid,bad,last}),exportCapture,disconnect});
})(window);
