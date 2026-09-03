(function installMorningBenchmarkData(){
  "use strict";
  const math4="1A8pWCwMekbLUJH9wHA-OGOfHJWS-cT5sXZeroqeWMo4";
  const hum4="18kBL6D0URUR5TfhpnUdJn6epXW_QfDR52zYvwdN8egc";
  const science4="1u8iUEzvXnj1FCK73smasdJQe7VlmkgZzqEKv14MO_0k";
  const math5="1JvgKSI8AmzYKjizPtLvSVgrR5T3lAr5OHm_6k2Vov3c";
  const hum5="1lZKTd6PhxR6oNqk12RIHrYdPpmc-kPbyk-S6fmEDI9w";
  const science5="1GV1pNNejTuy4yzQexfKNe_cdjugDnOmt2qkzDWmnHpQ";
  const q=(standard,skillId,sourceDocumentId,firstTaughtDay,sourceAuthority="pacing",examBlueprintId=null,examPreferredIndex=0,questionParams=null)=>({
    standard,skillId,sourceDocumentId,firstTaughtDay,sourceAuthority,examBlueprintId,examPreferredIndex,questionParams
  });
  window.DW_MORNING_BENCHMARKS={
    version:"q1-exam60-pacing40-v2",
    authorityWeights:{exam:0.60,pacingGuide:0.40},
    subjectCounts:{MATH:10,ELA:10,SCIENCE:10},
    forms:{
      I:{
        gradeLevel:4,
        title:"Grade 4 • Q1 Learning Benchmark",
        math:[
          q("4.NBT.A.1","math.pk.multiplication_patterns_over_increasing_place_",math4,5,"exam","I-MATH-Q1"),
          q("4.NBT.A.1","math.placevalue",math4,3,"exam","I-MATH-Q2"),
          q("4.NBT.A.2","math.write.multidigit",math4,7,"exam","I-MATH-Q3"),
          q("4.NBT.A.2","math.compare.whole",math4,9,"exam","I-MATH-Q4"),
          q("4.NBT.A.3","math.rounding",math4,11,"exam","I-MATH-Q5"),
          q("4.NBT.B.4","math.add.multi",math4,15,"exam","I-MATH-Q7"),
          q("4.NBT.B.4","math.sub.multi",math4,17),
          q("4.OA.A.3","math.wordproblems",math4,20,"pacing",null,0,{multiStep:true}),
          q("4.G.A.1","math.geom.lines",math4,25),
          q("4.G.A.3","math.symmetry",math4,33)
        ],
        ela:[
          q("4.RL.3","ela.character",hum4,3,"exam","I-HUM-Q4"),
          q("4.L.4a","ela.meaning",hum4,8,"exam","I-HUM-Q2"),
          q("4.RL.1","ela.supporting",hum4,6,"exam","I-HUM-Q5"),
          q("4.RL.6","ela.pov",hum4,13,"exam","I-HUM-Q6"),
          q("4.L.2a","ela.capitalization",hum4,3,"exam","I-HUM-Q10"),
          q("4.L.2c","ela.pk.commas_in_a_series",hum4,8,"exam","I-HUM-Q11"),
          q("4.W.1","ela.opinion",hum4,8),
          q("4.L.4b","curric.morph",hum4,3,"pacing",null,0,{root:"form",word:"format"}),
          q("4.L.4b","curric.morph",hum4,13,"pacing",null,0,{root:"scrib/script",word:"description"}),
          q("4.L.1f","ela.sent.three",hum4,18)
        ],
        science:[
          q("4-PS3-1","sci.speed_energy",science4,3,"exam","I-SCI-Q1"),
          q("4-PS3-2","sci.energy_transfer",science4,9,"exam","I-SCI-Q5"),
          q("4-PS3-3","sci.collisions",science4,16,"exam","I-SCI-Q10"),
          q("4-PS3-4","sci.energy_conversion",science4,16,"exam","I-SCI-Q3"),
          q("4-ESS3-1","sci.energy_resources",science4,22,"exam","I-SCI-Q4"),
          q("4-PS3-1","sci.speed_energy",science4,3,"exam","I-SCI-Q9",1),
          q("3-5-ETS1-1","sci.design_problem",science4,28),
          q("3-5-ETS1-2","sci.compare_solutions",science4,31),
          q("3-5-ETS1-3","sci.fair_test",science4,34),
          q("4-PS3-4","sci.energy_conversion",science4,18)
        ]
      },
      K:{
        gradeLevel:5,
        title:"Grade 5 • Q1 Learning Benchmark",
        math:[
          q("5.NBT.A.1","math.placevalue",math5,3,"exam","K-MATH-Q1"),
          q("5.NBT.A.1","math.pk.multiplication_patterns_over_increasing_place_",math5,5,"exam","K-MATH-Q2"),
          q("5.NBT.A.2","math.pk.multiplying_a_decimal_by_a_power_of_ten",math5,8,"exam","K-MATH-Q3"),
          q("5.NBT.A.2","math.pk.dividing_by_powers_of_ten",math5,11,"exam","K-MATH-Q4"),
          q("5.NBT.A.3b","math.dec.compare",math5,17,"exam","K-MATH-Q5"),
          q("5.NBT.A.4","math.pk.rounding_decimals",math5,20,"exam","K-MATH-Q7"),
          q("5.NBT.A.3a","math.dec.wordform",math5,13),
          q("5.NBT.A.3a","math.dec.expanded",math5,15),
          q("5.NBT.B.7","math.dec.sub",math5,27),
          q("5.G.B.3","math.pk.classifying_quadrilaterals",math5,35)
        ],
        ela:[
          q("5.RL.6","ela.pov",hum5,3,"exam","K-HUM-Q2"),
          q("5.RL.3","ela.character",hum5,3,"exam","K-HUM-Q3"),
          q("5.RL.1","ela.supporting",hum5,3,"exam","K-HUM-Q4"),
          q("5.RL.1","ela.meaning",hum5,18,"exam","K-HUM-Q6"),
          q("5.L.2c","ela.pk.commas_with_direct_addresses",hum5,3,"exam","K-HUM-Q9"),
          q("5.L.2","ela.capitalization",hum5,3,"exam","K-HUM-Q10"),
          q("5.RL.5","ela.pk.text_structures",hum5,13),
          q("5.L.3a","ela.pk.combining_sentences",hum5,15),
          q("5.L.3a","ela.pk.reducing_sentences",hum5,16),
          q("5.L.4b","curric.morph",hum5,13,"pacing",null,0,{root:"fer",word:"transfer"})
        ],
        science:[
          q("5.P1U1.1","sci.matter_properties",science5,3,"exam","K-SCI-STATE-Q1"),
          q("5.P1U1.2","sci.mass_conservation",science5,5,"exam","K-SCI-STATE-Q4"),
          q("5.P1U1.2","sci.physical_chemical_change",science5,7,"exam","K-SCI-STATE-Q7"),
          q("5-PS3-1","sci.food_energy",science5,11,"exam","K-SCI-NGSS-Q1"),
          q("5-LS1-1","sci.plant_materials",science5,19,"exam","K-SCI-NGSS-Q6"),
          q("5-LS2-1","sci.matter_movement",science5,25,"exam","K-SCI-NGSS-Q3"),
          q("5.P1U1.2","sci.density",science5,6),
          q("5.P2U1.3","sci.noncontact_forces",science5,9),
          q("3-5-ETS1-3","sci.fair_test",science5,8),
          q("3-5-ETS1-2","sci.compare_solutions",science5,10)
        ]
      }
    },
    officialStandards:{
      math:"https://www.azed.gov/standards-practices/k-12standards/mathematics-standards",
      ela:"https://www.azed.gov/standards-practices/k-12standards/english-language-arts-standards",
      science:"https://www.azed.gov/standards-practices/k-12standards/standards-science"
    }
  };
})();
