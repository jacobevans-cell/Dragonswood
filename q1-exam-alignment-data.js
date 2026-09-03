(function installQ1ExamAlignment(){
  "use strict";

  const exam=(id,standard,skillId,firstTaughtDay,sourceExam,sourceQuestion,preferredIndex=0,questionParams=null)=>({
    id,standard,skillId,firstTaughtDay,sourceExam,sourceQuestion,preferredIndex,questionParams
  });

  const forms={
    I:{
      gradeLevel:4,
      MATH:[
        exam("I-MATH-Q1","4.NBT.A.1","math.pk.multiplication_patterns_over_increasing_place_",5,"Math STEM I Q1 EXAM A.pdf",1),
        exam("I-MATH-Q2","4.NBT.A.1","math.placevalue",3,"Math STEM I Q1 EXAM A.pdf",2),
        exam("I-MATH-Q3","4.NBT.A.2","math.write.multidigit",7,"Math STEM I Q1 EXAM A.pdf",3),
        exam("I-MATH-Q4","4.NBT.A.2","math.compare.whole",9,"Math STEM I Q1 EXAM A.pdf",4),
        exam("I-MATH-Q5","4.NBT.A.3","math.rounding",11,"Math STEM I Q1 EXAM A.pdf",5),
        exam("I-MATH-Q6","4.NBT.A.3","math.rounding",13,"Math STEM I Q1 EXAM A.pdf",6,1),
        exam("I-MATH-Q7","4.NBT.B.4","math.add.multi",15,"Math STEM I Q1 EXAM A.pdf",7),
        exam("I-MATH-Q8","4.NBT.B.4","math.sub.multi",17,"Math STEM I Q1 EXAM A.pdf",8),
        exam("I-MATH-Q9","4.G.A.3","math.symmetry",33,"Math STEM I Q1 EXAM A.pdf",9),
        exam("I-MATH-Q10","4.G.A.3","math.symmetry",33,"Math STEM I Q1 EXAM A.pdf",10,1),
        exam("I-MATH-Q11","4.G.A.2","math.pk.acute_right_and_obtuse_triangles",36,"Math STEM I Q1 EXAM A.pdf",11),
        exam("I-MATH-Q12","4.G.A.2","math.pk.parallel_sides_in_quadrilaterals",29,"Math STEM I Q1 EXAM A.pdf",12),
        exam("I-MATH-Q13","4.G.A.2","math.pk.classifying_quadrilaterals",29,"Math STEM I Q1 EXAM A.pdf",13),
        exam("I-MATH-Q14","4.G.A.1","math.geom.lines",25,"Math STEM I Q1 EXAM A.pdf",14)
      ],
      HUM:[
        exam("I-HUM-Q1","4.RL.1","ela.meaning",3,"ELA HUM I Q1 Exam A.pdf",1),
        exam("I-HUM-Q2","4.L.4a","ela.meaning",8,"ELA HUM I Q1 Exam A.pdf",2),
        exam("I-HUM-Q3","4.L.5c","ela.antonyms.context",8,"ELA HUM I Q1 Exam A.pdf",3),
        exam("I-HUM-Q4","4.RL.3","ela.character",3,"ELA HUM I Q1 Exam A.pdf",4),
        exam("I-HUM-Q5","4.RL.1","ela.supporting",6,"ELA HUM I Q1 Exam A.pdf",5),
        exam("I-HUM-Q6","4.RL.6","ela.pov",13,"ELA HUM I Q1 Exam A.pdf",6),
        exam("I-HUM-Q7","4.RL.6","ela.pov",15,"ELA HUM I Q1 Exam A.pdf",7,1),
        exam("I-HUM-Q8","4.RL.2","ela.supporting",18,"ELA HUM I Q1 Exam A.pdf",8,1),
        exam("I-HUM-Q9","4.RL.1","ela.meaning",18,"ELA HUM I Q1 Exam A.pdf",9,2),
        exam("I-HUM-Q10","4.L.2a","ela.capitalization",3,"ELA HUM I Q1 Exam A.pdf",10),
        exam("I-HUM-Q11","4.L.2c","ela.pk.commas_in_a_series",8,"ELA HUM I Q1 Exam A.pdf",11),
        exam("I-HUM-Q12","4.L.1f","ela.usage.verbs",18,"ELA HUM I Q1 Exam A.pdf",12),
        exam("I-HUM-Q13","4.L.3a","ela.mod.comparative",18,"ELA HUM I Q1 Exam A.pdf",13)
      ],
      SCIENCE:[
        exam("I-SCI-Q1","4-PS3-1","sci.speed_energy",3,"SCI STEM I Q1.pdf",1),
        exam("I-SCI-Q2","4-PS3-4","sci.energy_resources",22,"SCI STEM I Q1.pdf",2),
        exam("I-SCI-Q3","4-PS3-4","sci.energy_conversion",16,"SCI STEM I Q1.pdf",3),
        exam("I-SCI-Q4","4-ESS3-1","sci.energy_resources",22,"SCI STEM I Q1.pdf",4,1),
        exam("I-SCI-Q5","4-PS3-2","sci.energy_transfer",9,"SCI STEM I Q1.pdf",5),
        exam("I-SCI-Q6","4-ESS3-1","sci.energy_resources",22,"SCI STEM I Q1.pdf",6,2),
        exam("I-SCI-Q7","4-PS3-4","sci.energy_conversion",16,"SCI STEM I Q1.pdf",7,1),
        exam("I-SCI-Q8","4-PS3-4","sci.energy_conversion",16,"SCI STEM I Q1.pdf",8,2),
        exam("I-SCI-Q9","4-PS3-1","sci.speed_energy",3,"SCI STEM I Q1.pdf",9,1),
        exam("I-SCI-Q10","4-PS3-3","sci.collisions",16,"SCI STEM I Q1.pdf",10)
      ]
    },
    K:{
      gradeLevel:5,
      MATH:[
        exam("K-MATH-Q1","5.NBT.A.1","math.placevalue",3,"Math STEM K Q1 EXAM A.pdf",1),
        exam("K-MATH-Q2","5.NBT.A.1","math.pk.multiplication_patterns_over_increasing_place_",5,"Math STEM K Q1 EXAM A.pdf",2),
        exam("K-MATH-Q3","5.NBT.A.2","math.pk.multiplying_a_decimal_by_a_power_of_ten",8,"Math STEM K Q1 EXAM A.pdf",3),
        exam("K-MATH-Q4","5.NBT.A.2","math.pk.dividing_by_powers_of_ten",11,"Math STEM K Q1 EXAM A.pdf",4),
        exam("K-MATH-Q5","5.NBT.A.3b","math.dec.compare",17,"Math STEM K Q1 EXAM A.pdf",5),
        exam("K-MATH-Q6","5.NBT.A.3a","math.dec.expanded",16,"Math STEM K Q1 EXAM A.pdf",6),
        exam("K-MATH-Q7","5.NBT.A.4","math.pk.rounding_decimals",20,"Math STEM K Q1 EXAM A.pdf",7),
        exam("K-MATH-Q8","5.NBT.A.4","math.pk.rounding_decimals",22,"Math STEM K Q1 EXAM A.pdf",8,1),
        exam("K-MATH-Q9","5.NBT.B.7","math.dec.add",25,"Math STEM K Q1 EXAM A.pdf",9),
        exam("K-MATH-Q10","5.NBT.B.7","math.dec.sub",26,"Math STEM K Q1 EXAM A.pdf",10),
        exam("K-MATH-Q11","5.G.B.3","math.pk.identifying_parallelograms",35,"Math STEM K Q1 EXAM A.pdf",11),
        exam("K-MATH-Q12","5.G.B.3","math.pk.classifying_quadrilaterals",35,"Math STEM K Q1 EXAM A.pdf",12)
      ],
      HUM:[
        exam("K-HUM-Q1","5.RL.1","ela.meaning",3,"ELA HUM K Q1 Exam A.pdf",1),
        exam("K-HUM-Q2","5.RL.6","ela.pov",3,"ELA HUM K Q1 Exam A.pdf",2),
        exam("K-HUM-Q3","5.RL.3","ela.character",3,"ELA HUM K Q1 Exam A.pdf",3),
        exam("K-HUM-Q4","5.RL.1","ela.supporting",3,"ELA HUM K Q1 Exam A.pdf",4),
        exam("K-HUM-Q5","5.RL.3","ela.character",5,"ELA HUM K Q1 Exam A.pdf",5,1),
        exam("K-HUM-Q6","5.RL.1","ela.meaning",18,"ELA HUM K Q1 Exam A.pdf",6,1),
        exam("K-HUM-Q7","5.RL.3","ela.character",5,"ELA HUM K Q1 Exam A.pdf",7,2),
        exam("K-HUM-Q8","5.RL.1","ela.meaning",18,"ELA HUM K Q1 Exam A.pdf",8,2),
        exam("K-HUM-Q9","5.L.2c","ela.pk.commas_with_direct_addresses",3,"ELA HUM K Q1 Exam A.pdf",9),
        exam("K-HUM-Q10","5.L.2","ela.capitalization",3,"ELA HUM K Q1 Exam A.pdf",10),
        exam("K-HUM-Q11","5.L.3a","ela.pk.correcting_inappropriate_shifts_in_verb_tense",18,"ELA HUM K Q1 Exam A.pdf",11),
        exam("K-HUM-Q12","5.L.3a","ela.pk.interjections",18,"ELA HUM K Q1 Exam A.pdf",12)
      ],
      SCIENCE:[
        exam("K-SCI-STATE-Q1","5.P1U1.1","sci.matter_properties",3,"SCI STEM K Q1.pdf",1),
        exam("K-SCI-STATE-Q2","5.P1U1.1","sci.matter_properties",3,"SCI STEM K Q1.pdf",2,1),
        exam("K-SCI-STATE-Q3","5.P1U1.1","sci.matter_properties",4,"SCI STEM K Q1.pdf",3,2),
        exam("K-SCI-STATE-Q4","5.P1U1.2","sci.mass_conservation",5,"SCI STEM K Q1.pdf",4),
        exam("K-SCI-STATE-Q5","5.P1U1.2","sci.density",6,"SCI STEM K Q1.pdf",5),
        exam("K-SCI-STATE-Q6","5.P1U1.1","sci.matter_properties",3,"SCI STEM K Q1.pdf",6,3),
        exam("K-SCI-STATE-Q7","5.P1U1.2","sci.physical_chemical_change",7,"SCI STEM K Q1.pdf",7),
        exam("K-SCI-STATE-Q8","5.P1U1.1","sci.matter_properties",3,"SCI STEM K Q1.pdf",8,4),
        exam("K-SCI-STATE-Q9","5.P1U1.2","sci.physical_chemical_change",8,"SCI STEM K Q1.pdf",9,1),
        exam("K-SCI-STATE-Q10","5.P1U1.1","sci.matter_properties",4,"SCI STEM K Q1.pdf",10,5),
        exam("K-SCI-STATE-Q11","5.P1U1.2","sci.physical_chemical_change",8,"SCI STEM K Q1.pdf",11,2),
        exam("K-SCI-STATE-Q12","5.P2U1.3","sci.noncontact_forces",9,"SCI STEM K Q1.pdf",12),
        exam("K-SCI-STATE-Q13","5.P2U1.3","sci.noncontact_forces",9,"SCI STEM K Q1.pdf",13,1),
        exam("K-SCI-STATE-Q14","5.P2U1.3","sci.noncontact_forces",9,"SCI STEM K Q1.pdf",14,2),
        exam("K-SCI-STATE-Q15","5.P2U1.3","sci.noncontact_forces",10,"SCI STEM K Q1.pdf",15,3),
        exam("K-SCI-NGSS-Q1","5-PS3-1","sci.food_energy",11,"SCI STEM K Q1 EXAM A (NGSS).pdf",1),
        exam("K-SCI-NGSS-Q2","5-PS3-1","sci.food_energy",13,"SCI STEM K Q1 EXAM A (NGSS).pdf",2,1),
        exam("K-SCI-NGSS-Q3","5-LS2-1","sci.matter_movement",25,"SCI STEM K Q1 EXAM A (NGSS).pdf",3),
        exam("K-SCI-NGSS-Q4","5-LS2-1","sci.matter_movement",28,"SCI STEM K Q1 EXAM A (NGSS).pdf",4,1),
        exam("K-SCI-NGSS-Q5","5-PS3-1","sci.food_energy",14,"SCI STEM K Q1 EXAM A (NGSS).pdf",5,2),
        exam("K-SCI-NGSS-Q6","5-LS1-1","sci.plant_materials",19,"SCI STEM K Q1 EXAM A (NGSS).pdf",6),
        exam("K-SCI-NGSS-Q7","5-LS2-1","sci.matter_movement",26,"SCI STEM K Q1 EXAM A (NGSS).pdf",7,2),
        exam("K-SCI-NGSS-Q8","5-LS1-1","sci.plant_materials",20,"SCI STEM K Q1 EXAM A (NGSS).pdf",8,1),
        exam("K-SCI-NGSS-Q9","5-LS1-1","sci.plant_materials",20,"SCI STEM K Q1 EXAM A (NGSS).pdf",9,2),
        exam("K-SCI-NGSS-Q10","5-LS2-1","sci.matter_movement",25,"SCI STEM K Q1 EXAM A (NGSS).pdf",10,3),
        exam("K-SCI-NGSS-Q11","5-LS1-1","sci.plant_materials",20,"SCI STEM K Q1 EXAM A (NGSS).pdf",11,3),
        exam("K-SCI-NGSS-Q12","5-LS2-1","sci.matter_movement",28,"SCI STEM K Q1 EXAM A (NGSS).pdf",12,3)
      ]
    }
  };

  const pacingBridges={
    K:{Science:{
      3:{standards:["5.P1U1.1"],skills:["sci.matter_properties"],iCan:"I can explain that matter has mass, takes up space, and is made of particles too small to see."},
      4:{standards:["5.P1U1.1"],skills:["sci.matter_properties"],iCan:"I can identify and measure useful physical properties of matter."},
      5:{standards:["5.P1U1.2"],skills:["sci.mass_conservation"],iCan:"I can use mass evidence to show that matter is conserved when substances are mixed."},
      6:{standards:["5.P1U1.2"],skills:["sci.density"],iCan:"I can use a density model to compare how materials layer in a liquid."},
      7:{standards:["5.P1U1.2"],skills:["sci.physical_chemical_change"],iCan:"I can distinguish a physical change from a chemical change using evidence."},
      8:{standards:["5.P1U1.2"],skills:["sci.physical_chemical_change"],iCan:"I can identify evidence that a new substance formed during a chemical change."},
      9:{standards:["5.P2U1.3"],skills:["sci.noncontact_forces"],iCan:"I can compare contact forces with electric and magnetic forces that act at a distance."},
      10:{standards:["5.P2U1.3"],skills:["sci.noncontact_forces"],iCan:"I can explain friction, magnetism, and static electricity in familiar situations."}
    }}
  };

  const baseline={
    I:{SCIENCE:[exam("I-SCI-BASE","3-5-SEP","sci.observation_evidence",0,"SCI STEM I Q1.pdf","scenario reasoning")]},
    K:{SCIENCE:[exam("K-SCI-BASE","3-5-SEP","sci.observation_evidence",0,"SCI STEM K Q1.pdf","scenario reasoning")]}
  };

  const byId={};
  for(const form of Object.values(forms))for(const rows of [form.MATH,form.HUM,form.SCIENCE])for(const row of rows)byId[row.id]=row;
  for(const form of Object.values(baseline))for(const rows of Object.values(form))for(const row of rows)byId[row.id]=row;

  window.DW_Q1_EXAM_ALIGNMENT={
    version:"q1-exam60-pacing40-v2",
    authorityWeights:{exam:0.60,pacingGuide:0.40},
    morningSubjects:{MATH:10,HUM:10,SCIENCE:10},
    excludedSubjects:["SOCIAL STUDIES","SS"],
    forms,baseline,byId,pacingBridges,
    sources:{
      exams:["ELA HUM I Q1 Exam A.pdf","ELA HUM K Q1 Exam A.pdf","Math STEM I Q1 EXAM A.pdf","Math STEM K Q1 EXAM A.pdf","SCI STEM I Q1.pdf","SCI STEM K Q1 EXAM A (NGSS).pdf","SCI STEM K Q1.pdf"],
      intentionallyExcluded:["SS HUM I Q1.pdf","SS HUM K Q1.pdf"]
    }
  };
})();
