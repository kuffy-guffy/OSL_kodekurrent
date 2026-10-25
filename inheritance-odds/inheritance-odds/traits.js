// traits.js: the genetics data, moved here from the HTML page.
// Edit this file to add or change genes. The browser never sees the phen() functions.
const T=[
 {id:'cf',name:'Cystic fibrosis',gene:'CFTR gene',mode:'Autosomal recessive: a child is affected only with two variant copies',
  alleles:['N','c'],geno:{NN:'No variant',Nc:'Carrier',cc:'Two variants'},def:['Nc','Nc'],
  phen:g=>g==='cc'?['Affected','hi']:g==='Nc'?['Carrier, unaffected','mid']:['Not a carrier','ok']},
 {id:'scd',name:'Sickle cell disease',gene:'HBB gene',mode:'Autosomal recessive',
  alleles:['A','S'],geno:{AA:'No variant',AS:'Carrier (sickle trait)',SS:'Sickle cell disease'},def:['AS','AS'],
  phen:g=>g==='SS'?['Sickle cell disease','hi']:g==='AS'?['Carrier, usually unaffected','mid']:['Not a carrier','ok']},
 {id:'hd',name:'Huntington’s disease',gene:'HTT gene',mode:'Autosomal dominant: one expanded copy is enough',
  alleles:['N','H'],geno:{NN:'No expansion',NH:'One expanded copy',HH:'Two expanded copies'},def:['NH','NN'],
  phen:g=>g==='NN'?['Will not develop it','ok']:['Will develop it (late onset)','hi']},
 {id:'abo',name:'ABO blood group',gene:'ABO gene',mode:'Co-dominant A and B, recessive O',
  alleles:['A','B','O'],geno:{AA:'Group A',AO:'Group A',BB:'Group B',BO:'Group B',AB:'Group AB',OO:'Group O'},def:['AO','BO'],
  phen:g=>[{AA:'Group A',AO:'Group A',BB:'Group B',BO:'Group B',AB:'Group AB',OO:'Group O'}[g],'neu']},
 {id:'rh',name:'Rh factor',gene:'RHD gene',mode:'Rh-positive is dominant',
  alleles:['D','d'],geno:{DD:'Rh-positive',Dd:'Rh-positive',dd:'Rh-negative'},def:['DD','dd'],
  phen:g=>g==='dd'?['Rh-negative','neu']:['Rh-positive','neu']}
];
const AR=(id,name,gene,v,aff,extra)=>({id,name,gene,mode:'Autosomal recessive'+(extra||''),alleles:['N',v],geno:{['NN']:'No variant',['N'+v]:'Carrier',[v+v]:'Two variants'},def:['N'+v,'N'+v],phen:g=>g===v+v?[aff,'hi']:g==='N'+v?['Carrier, unaffected','mid']:['Not a carrier','ok']});
const AD=(id,name,gene,extra,L)=>({id,name,gene,mode:'Autosomal dominant'+extra,alleles:['N','V'],geno:Object.assign({NN:'No variant',NV:'One variant'},L[2]?{VV:'Two variants'}:{}),def:['NV','NN'],phen:g=>L[g==='NN'?0:g==='NV'?1:2]});
T.push(
 AR('thal','Beta thalassaemia','HBB gene','t','Thalassaemia major or intermedia (severity varies)','. Common across South Asia'),
 AR('pku','Phenylketonuria (PKU)','PAH gene','p','PKU (manageable with early dietary treatment)'),
 AR('tay','Tay-Sachs disease','HEXA gene','v','Tay-Sachs disease'),
 AR('sma','Spinal muscular atrophy','SMN1 gene','v','Spinal muscular atrophy'),
 AR('wil','Wilson disease','ATP7B gene','v','Wilson disease (treatable)'),
 AR('alb','Oculocutaneous albinism','TYR and OCA2 genes','v','Albinism'),
 AR('hfe','Hereditary hemochromatosis (C282Y)','HFE gene','Y','Higher risk of iron overload (many never develop it)','. Low penetrance'),
 AD('fh','Familial hypercholesterolaemia','LDLR gene','',[['Typical cholesterol genetics','ok'],['Raised LDL cholesterol from birth (treatable)','mid'],['Severe early-onset cholesterol disease','hi']]),
 AD('mfn','Marfan syndrome','FBN1 gene','',[['Not affected','ok'],['Marfan syndrome','hi']]),
 AD('fvl','Factor V Leiden','F5 gene','. Incomplete penetrance: carrying it does not mean a clot will happen',[['Typical clot risk','ok'],['Somewhat raised clot risk; most never have a clot','mid'],['Higher clot risk','hi']]),
 {id:'lact',cat:'Everyday traits',name:'Lactase persistence (milk digestion)',gene:'LCT and MCM6 region',mode:'Persistence is dominant. Covers the common -13910 T variant only; other variants exist',alleles:['C','T'],geno:{CC:'No persistence variant',CT:'One persistence variant',TT:'Two persistence variants'},def:['CT','CC'],phen:g=>g==='CC'?['Likely lactase non-persistent (milk may upset the gut in adulthood)','neu']:['Likely lactase persistent (digests milk in adulthood)','neu']},
 {id:'ear',cat:'Everyday traits',name:'Earwax type',gene:'ABCC11 gene',mode:'Dry earwax is recessive',alleles:['W','d'],geno:{WW:'Two wet-type copies',Wd:'One of each',dd:'Two dry-type copies'},def:['Wd','Wd'],phen:g=>g==='dd'?['Dry, flaky earwax','neu']:['Wet, sticky earwax','neu']},
 {id:'actn3',cat:'Everyday traits',name:'ACTN3 muscle protein (R577X)',gene:'ACTN3 gene',mode:'Co-dominant. Linked to muscle fibre makeup, but it does not decide athletic ability',alleles:['R','X'],geno:{RR:'Two R copies',RX:'One of each',XX:'Two X copies'},def:['RX','RX'],phen:g=>g==='XX'?['No alpha-actinin-3 (common and harmless)','neu']:g==='RX'?['Some alpha-actinin-3','neu']:['Full alpha-actinin-3','neu']}
);

const OUT={
 cf:`Lifelong treatment is needed. Survival has improved a lot with modern care, but outcomes depend on access to a specialist centre.`,
 scd:`Outcomes vary widely. With early diagnosis, vaccines, penicillin and hydroxyurea, most children reach adulthood. Access to care matters a great deal.`,
 hd:`Symptoms usually begin in adulthood, so childhood survival is not affected. There is no cure yet.`,
 thal:`Severe forms need regular transfusions and iron-chelation treatment. With good care many people live well into adulthood.`,
 pku:`Detected by newborn screening. With a lifelong diet, life expectancy is typically normal. Untreated, it causes severe intellectual disability.`,
 tay:`The classic infant form is usually fatal in early childhood. Rarer late-onset forms exist.`,
 sma:`Severity depends on the type. Severe infant forms were once usually fatal in early childhood; newer treatments have greatly improved outcomes when started early.`,
 wil:`Treatable with lifelong medication, and life expectancy is normal when diagnosed early. It can be fatal if untreated.`,
 alb:`Does not usually shorten life. Needs sun protection and regular eye care.`,
 hfe:`Many people never become ill. Early detection and treatment prevent organ damage.`,
 fh:`Treatable with medication. Untreated, it raises the risk of early heart disease; the severe two-copy form can cause heart disease in childhood.`,
 mfn:`Outlook depends on regular heart and aorta monitoring, which has greatly improved life expectancy.`,
 fvl:`Does not usually affect survival. It raises the risk of blood clots, especially around surgery, pregnancy or long immobility.`
};

module.exports = { T, OUT };
