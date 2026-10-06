// Fixed reference data: categories, products, lines, people, severity/status colours.
export const CATS = [['temperature','thermometer'],['hygiene','hand'],['foreign','nut'],['pest','bug'],['equipment','wrench'],['allergen','wheat'],['labelling','tag'],['cleaning','spray-can'],['custom','pencil-line']];
export const PTYPES=['UHT milk','SCM','Yogurt'];
export const PNAMES={'UHT milk':['ADCaMg 100ml','Bestcows'],'SCM':['Commander'],'Yogurt':['Yogurt Plain','Yogurt Sweet']};
export const HC_TYPES=['swollen','leak','lab']; export const HC_DAYS=[1,3,7]; export const HC_OWNERS=['QC team','Sokha','Dara','Vina'];
// Label for a date N days from today, e.g. "Tue, 29 Sept" — or for an ISO date.
export const dueLabel=d=>{const x=typeof d==='string'?new Date(d):new Date(); if(typeof d!=='string') x.setDate(x.getDate()+d); return x.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});};
export const UNITS=['pcs','cartons','kg']; export const SUPPORTS=['QA','Supervisor','Maintenance'];
// CIP (cleaning in place) after a lot ends: 4 hours as standard; maintenance or a system error take longer.
export const CIP_HOURS=4; export const CIP_CHOICES=[4,6,8,12]; export const CIP_REASONS=['standard','maintenance','error','other'];
export const SEV = [{bg:'var(--gray-100)',fg:'var(--gray-700)',bar:'var(--gray-300)'},{bg:'var(--blue-100)',fg:'var(--blue-700)',bar:'var(--blue-500)'},{bg:'var(--amber-100)',fg:'var(--amber-700)',bar:'var(--amber-500)'},{bg:'var(--red-100)',fg:'var(--red-700)',bar:'var(--red-500)'}];
export const ST = {open:{i:0,bg:'var(--blue-100)',fg:'var(--blue-700)'},action:{i:1,bg:'var(--amber-100)',fg:'var(--amber-700)'},verify:{i:2,bg:'var(--blue-100)',fg:'var(--navy-900)'},closed:{i:3,bg:'var(--green-100)',fg:'var(--green-700)'}};
export const MGR_AV = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%230F2D58'/><text x='20' y='26' font-family='Arial,sans-serif' font-size='15' font-weight='700' fill='white' text-anchor='middle'>CH</text></svg>";
export const ORDER = ['qc','qa','supervisor','manager'];
export const PEOPLE = {qc:{name:'Sokha',avatar:'images/avatars/sokha.png'},qa:{name:'Vina',avatar:'images/avatars/vina.png'},supervisor:{name:'Dara',avatar:'images/avatars/dara.png'},manager:{name:'Chanthy',avatar:MGR_AV}};
export const AV = {Sokha:'images/avatars/sokha.png',Dara:'images/avatars/dara.png',Vina:'images/avatars/vina.png',Chanthy:MGR_AV};
export const TREND = {line:[['UHT line 2',7],['SCM line 1',4],['Yogurt line 3',3],['UHT line 4',1]],product:[['ADCaMg 100ml',5],['Commander',4],['Yogurt Sweet',3],['Bestcows',2],['Yogurt Plain',1]]};
export const LOCS = ['SCM line 1','UHT line 2','Yogurt line 3','UHT line 4','Packing','Receiving'];
export const LINES = [
  {name:'SCM line 1',type:'SCM',product:'Commander',qty:80,target:120,status:'running'},
  {name:'UHT line 2',type:'UHT',product:'ADCaMg 100ml',qty:42,target:100,status:'stopped'},
  {name:'Yogurt line 3',type:'Yogurt',product:'Yogurt Sweet',qty:35,target:60,status:'running'},
  {name:'UHT line 4',type:'UHT',product:'Bestcows',qty:0,target:90,status:'cleaning'}];
export const TITLES = {temperature:'Temperature out of range',hygiene:'Hygiene problem',foreign:'Foreign object found',pest:'Pest seen',equipment:'Equipment fault',allergen:'Allergen control issue',labelling:'Labelling error',cleaning:'Cleaning not done',custom:'Other problem'};
export const TONE = {red:['var(--red-100)','var(--red-700)'],blue:['var(--blue-100)','var(--blue-700)'],green:['var(--green-100)','var(--green-700)'],amber:['var(--amber-100)','var(--amber-700)']};
