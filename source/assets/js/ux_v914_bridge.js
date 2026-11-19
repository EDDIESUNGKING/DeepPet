/* V9.14 Report extraction: isolate by pet ID, honor edit/delete overrides. */
(function(){'use strict';
 window.dp914ReportRecords=function(petIndex){
  const previous=state.dog;try{
   state.dog=petIndex;
   const active=petIndex>=dogs.length?[]:((petIndex===0||petIndex===5||petIndex===9||petIndex===11||petIndex===13)?[]:reportAvailableDates());
   const out=[];
   for(const date of active){const i=reportAvailableDates().indexOf(date);if(i<0)continue;for(const e of reportEntriesForDate(i))out.push(window.DeepPetExamFixture?.enrich(e,petIndex,date,i)||{...e,date});}
   const personal=state.userReportEntries?.[String(petIndex)]||[];const enteredDays=new Set(personal.map(x=>x.date));
   for(let i=out.length-1;i>=0;i--)if(out[i].source==='sample'&&enteredDays.has(out[i].date))out.splice(i,1);
   for(const e of personal)if(!out.some(x=>x.id===e.id))out.push(e);
   return out;
  }finally{state.dog=previous;}
 };
})();
