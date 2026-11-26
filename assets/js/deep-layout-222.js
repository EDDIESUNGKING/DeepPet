/* V10.222: presentation only. Existing guidance, score and navigation nodes are moved, not recomputed. */
(function(){'use strict';
const q=(e,s)=>e?.querySelector(s), a=(e,s)=>Array.from(e?.querySelectorAll(s)||[]);
const copy={cardio:['綜合評估心跳、呼吸、HRV及心搏節奏。','综合评估心跳、呼吸、HRV及心搏节奏。','Overall heart rate, breathing, HRV and beat regularity.','심박수, 호흡, HRV 및 심박 리듬을 종합 평가합니다.'],sleep:['反映休息時間、睡眠品質及連續性。','反映休息时间、睡眠品质及连续性。','Rest duration, sleep quality and continuity.','휴식 시간, 수면의 질 및 연속성을 반영합니다.'],activityRecovery:['綜合反映活動後的恢復、整體精力與活動表現。','综合反映活动后的恢复、整体精力与活动表现。','Overall energy, activity and post-activity recovery.','활력, 활동 및 활동 후 회복을 종합 평가합니다.'],heart:['心率水平與心跳穩定性。','心率水平与心跳稳定性。','Heart rate and its stability.','심박수와 안정성.'],breath:['呼吸頻率與呼吸穩定性。','呼吸频率与呼吸稳定性。','Breathing rate and stability.','호흡수와 안정성.'],hrv:['有效心搏間隔的變異程度。','有效心搏间隔的变异程度。','Variation in valid beat intervals.','유효 심박 간격의 변이도.'],stable:['有效心搏節奏的規律性。','有效心搏节奏的规律性。','Regularity of valid heartbeats.','유효 심박 리듬의 규칙성.'],energy:['日常活動中的活力與活動表現。','日常活动中的活力与活动表现。','Daily energy and activity.','일상 활력과 활동 상태.'],recovery:['活動後兩分鐘的心率與呼吸恢復表現。','活动后两分钟的心率与呼吸恢复表现。','Heart rate and breathing recovery within two minutes after activity.','활동 후 2분 동안의 심박수와 호흡 회복.'],calm:['安靜休息時的生理平穩程度。','安静休息时的生理平稳程度。','Physiological stability during quiet rest.','안정 시 생리적 평온도.']};
const glyph={heart:'M12 20S3 15 3 8.5C3 3 9 2 12 7c3-5 9-4 9 1.5C21 15 12 20 12 20Z',breath:'M12 3v9m-2-3C6 5 3 10 3 16c0 5 7 4 7 0V9m4 0c4-4 7 1 7 7 0 5-7 4-7 0V9',hrv:'M2 13h4l3-8 4 15 3-10 2 3h4',stable:'M2 12h5l2-5 4 10 3-5h6',energy:'M13 2 3 14h8l-1 8 11-13h-8z',recovery:'M20 8A9 9 0 0 0 4 7L2 10m0-7v7h7m-5 6a9 9 0 0 0 16 1l2-3m0 7v-7h-7',calm:'M12 16C3 16 2 6 7 5c2 0 4 3 5 6 1-3 3-6 5-6 5 1 4 11-5 11Zm0 0c-4 5-10 4-10-1m10 1c4 5 10 4 10-1'};
function el(tag,cl,text){let n=document.createElement(tag);n.className=cl;if(text)n.textContent=text;return n;}
function desc(key){return copy[key]?.[({zht:0,zh:1,en:2,ko:3})[state.lang]??2]||'';}
function subtitle(host,key){if(q(host,'.dp222-caption'))return;let old=q(host,':scope > .dp217-energy-caption');if(old){old.classList.add('dp222-caption');return;}let h=q(host,'h2,h3');if(h)h.after(el('p','dp222-caption',desc(key)));}
function icon(key){let n=el('span','dp222-icon');n.setAttribute('aria-hidden','true');n.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${glyph[key]||glyph.stable}"/></svg>`;return n;}
function run(){const main=q(document,'#app .app-main');if(!main||state.tab!=='deep')return;
 // Do not expose proprietary calculation block in deep views; keep original explanations and data.
 for(let x of a(main,'.dp215-method'))x.remove();
 if(state.detail)return;
 const root=q(main,'.dp-owner-deep');if(!root)return;root.classList.add('dp222-layout');root.dataset.dp222Theme=['cardio','sleep','energy'][Number(state.deepType)]||'energy';
 const key=['cardio','sleep','activityRecovery'][Number(state.deepType)];
 for(let head of a(root,'.dp217-primary')){const title=q(head,'.dp217-title'),score=q(head,'.dp217-primary-score');if(!title||!score)continue;head.classList.add('dp222-main-head');subtitle(title,key);
 const guide=q(head.parentElement,`:scope > [data-dp215-metric="${key}"]`);if(guide){const risk=q(guide,'.dp215-risk-label');if(risk){for(const old of a(title,'.dp222-main-risk'))old.remove();const wrap=el('div','dp222-main-risk');wrap.dataset.risk=guide.dataset.risk;wrap.dataset.urgency=guide.dataset.urgency;wrap.append(risk);title.append(wrap);}guide.classList.add('dp222-summary-body');}
 }
 const cards=a(root,'.dp903-metric-card,.dp901-metric-card');
 if(cards.length){let first=cards[0],anchor=first.parentElement.classList.contains('dp903-metric-list')?first.parentElement:first;if(!q(root,'.dp222-details-title'))anchor.before(el('h3','dp222-details-title',({zht:'詳細分析',zh:'详细分析',en:'Detailed analysis',ko:'상세 분석'})[state.lang]||'Detailed analysis'));}
 let energyIndex=0;
 for(const card of cards){const isEnergy=card.classList.contains('dp901-metric-card'),key=isEnergy?['energy','recovery','calm'][energyIndex++]:card.dataset.dp903Metric;const left=q(card,'.dp903-metric-left,.dp901-card-copy'),rail=q(card,'.dp903-score-col,.dp901-score-col');if(!left||!rail||!key)continue;const g=q(card,'.dp215-guidance');card.classList.add('dp222-child');let head=isEnergy?q(card,'.dp901-card-head'):null;if(!head){head=el('div','dp222-child-head');card.prepend(head);head.append(left,rail);}head.classList.add('dp222-child-head');left.classList.add('dp222-copy');rail.classList.add('dp222-rail');subtitle(left,key);if(!q(head,'.dp222-icon'))head.prepend(icon(key));if(g)head.after(g);
 }
}
const prev=render;render=function(...args){const ret=prev.apply(this,args);try{run();window.DeepPetBuildVersion='10.222';a(document,'#app .app-build-version').forEach(e=>e.textContent='DeepPet Version 10.222');}catch(e){console.error('V10.222 layout',e);}return ret;};render(false);
})();
