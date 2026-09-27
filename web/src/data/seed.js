// Demo reports and notifications the app starts with.
import { dueLabel } from './constants.js';

export const SEED = [
  {id:'TR-1042',level:'supervisor',title:'Sterilizer temp below 137°C',cat:'temperature',sev:3,loc:'UHT line 2',status:'action',by:'Sokha',time:'09:12',photo:'IMG_0418.jpg',ptype:'UHT milk',pname:'ADCaMg 100ml',lot:'U260926-02',qty:'120',unit:'cartons',hold:true,holdCheck:{type:'swollen',days:3,owner:'Dara',status:'scheduled',due:dueLabel(3)},urgent:true,support:['QA','Maintenance'],
    desc:'Chart showed 134°C for about 4 minutes at 09:05.',action:'Stopped the filler and moved output to the hold area.',suggestion:'Check the steam valve before every restart.',voice:false,
    capa:{root:'Equipment',text:'Repair steam valve, re-sterilize line, test held cartons before release.',owner:'Dara',due:'Today 12:00'},
    tl:[['reported','Sokha','09:12'],['alert','System','09:12'],['esc','System','09:12',' QA · critical'],['hcSet','Vina','09:15'],['esc','Vina','09:18',' Supervisor · needs maintenance'],['assigned','Dara','09:20',' Dara']]},
  {id:'TR-1041',level:'qa',title:'Metal fragment found at filler',cat:'foreign',sev:2,loc:'SCM line 1',status:'verify',by:'Sokha',time:'Wed',photo:'IMG_0402.jpg',ptype:'SCM',pname:'Commander',lot:'S260925-11',qty:'40',unit:'cartons',hold:true,holdCheck:{type:'swollen',days:3,owner:'Sokha',status:'due',due:'Today'},urgent:false,support:['QA'],
    desc:'Small metal piece found in a can at the filling station.',action:'Held the lot and stopped the line.',suggestion:'Add a metal detector check every hour.',voice:true,
    capa:{root:'Equipment',text:'Inspect filler nozzle, run metal detector test, re-check held lot.',owner:'Dara',due:'Wed 17:00'},
    tl:[['reported','Sokha','Wed 14:05'],['esc','System','Wed 14:05',' QA · high severity'],['hcSet','Vina','Wed 14:20'],['assigned','Vina','Wed 14:30',' Dara'],['done','Dara','Wed 16:40'],['hcRem','System','Today 07:00']]},
  {id:'TR-1039',level:'qc',title:'No soap at hand-wash sink',cat:'hygiene',sev:1,loc:'Yogurt line 3',status:'open',by:'Sokha',time:'08:40',photo:'IMG_0415.jpg',ptype:'',pname:'',lot:'',qty:'',unit:'pcs',hold:false,urgent:false,support:['Supervisor'],
    desc:'Dispenser empty since start of shift.',action:'Used the sink at the entrance.',suggestion:'',voice:false,capa:null,tl:[['reported','Sokha','08:40']]},
  {id:'TR-1037',level:'qa',title:'Wrong expiry date on cups',cat:'labelling',sev:2,loc:'Packing',status:'open',by:'Sokha',time:'07:55',photo:'IMG_0411.jpg',ptype:'Yogurt',pname:'Yogurt Sweet',lot:'',qty:'',unit:'pcs',hold:false,urgent:false,support:[],
    desc:'',action:'',suggestion:'',voice:false,capa:null,tl:[['reported','Sokha','07:55'],['esc','System','07:55',' QA · high severity']]},
  {id:'TR-1035',level:'manager',title:'Milk powder lot out of spec',cat:'custom',sev:2,loc:'Receiving',status:'open',by:'Vina',time:'Thu',photo:'IMG_0396.jpg',ptype:'SCM',pname:'Commander',lot:'MP-0921',qty:'800',unit:'kg',hold:true,urgent:false,support:['Supervisor'],
    desc:'Supplier certificate shows moisture 4.8% (limit 4.0%).',action:'Held all bags in receiving.',suggestion:'Ask the supplier for a corrective action report.',voice:false,capa:null,
    tl:[['reported','Vina','Thu 11:20'],['esc','Vina','Thu 15:00',' Supervisor · needs another team'],['esc','Dara','Fri 09:10',' Manager · needs more authority']]},
  {id:'TR-1034',level:'supervisor',title:'Guard missing on conveyor',cat:'equipment',sev:1,loc:'Yogurt line 3',status:'action',by:'Sokha',time:'Thu',photo:'IMG_0394.jpg',ptype:'',pname:'',lot:'',qty:'',unit:'pcs',hold:false,urgent:false,support:['Maintenance'],
    desc:'Side guard removed after cleaning and not put back.',action:'Told the operator to keep hands clear.',suggestion:'',voice:false,
    capa:{root:'People',text:'Refit the conveyor guard and check all guards on line 3.',owner:'Dara',due:'Thu 17:00',overdue:true},
    tl:[['reported','Sokha','Thu 08:30'],['esc','Sokha','Thu 08:35',' Supervisor · needs another team'],['assigned','Dara','Thu 09:00',' Dara']]},
  {id:'TR-1036',level:'qa',title:'Fly near dock door',cat:'pest',sev:0,loc:'Receiving',status:'closed',by:'Sokha',time:'Mon',photo:'IMG_0390.jpg',ptype:'',pname:'',lot:'',qty:'',unit:'pcs',hold:false,urgent:false,support:[],
    desc:'One fly seen at the air curtain.',action:'Closed the door.',suggestion:'',voice:false,
    capa:{root:'Environment',text:'Check the air curtain and call pest control for a routine visit.',owner:'Dara',due:'Tue'},
    tl:[['reported','Sokha','Mon 10:02'],['assigned','Vina','Mon 10:30',' Dara'],['done','Dara','Tue 09:00'],['verified','Vina','Tue 11:15']]}
];
export const NOTES = [
  {id:'TR-1041',icon:'bell-ring',tone:'amber',text:'Reminder: day-3 swollen check due today for Commander, lot S260925-11 (40 cartons on hold)',t:'07:00',roles:['qc','qa']},
  {id:'TR-1042',icon:'siren',tone:'red',text:'Critical: Sterilizer temp below 137°C on UHT line 2',t:'09:12',roles:['qa','supervisor','manager']},
  {id:'TR-1042',icon:'arrow-up-right',tone:'blue',text:'Vina escalated TR-1042 to you: needs maintenance',t:'09:18',roles:['supervisor']},
  {id:'TR-1037',icon:'arrow-up-right',tone:'blue',text:'New for QA: Wrong expiry date on cups',t:'07:55',roles:['qa']},
  {id:'TR-1041',icon:'circle-check',tone:'green',text:'Dara finished the action on TR-1041. Ready to verify.',t:'Wed',roles:['qa']},
  {id:'TR-1035',icon:'arrow-up-right',tone:'blue',text:'Dara escalated TR-1035 to you: Milk powder lot out of spec',t:'Fri',roles:['manager']},
  {id:'TR-1034',icon:'clock',tone:'red',text:'Overdue: Guard missing on conveyor (was due Thu 17:00)',t:'Fri',roles:['supervisor','manager']},
  {id:'TR-1036',icon:'circle-check',tone:'green',text:'Your report TR-1036 was closed. Thank you!',t:'Tue',roles:['qc']}
];
