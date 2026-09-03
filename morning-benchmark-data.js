(function installMorningBenchmarkData(){
  "use strict";
  const math4="1A8pWCwMekbLUJH9wHA-OGOfHJWS-cT5sXZeroqeWMo4";
  const hum4="18kBL6D0URUR5TfhpnUdJn6epXW_QfDR52zYvwdN8egc";
  const math5="1JvgKSI8AmzYKjizPtLvSVgrR5T3lAr5OHm_6k2Vov3c";
  const hum5="1lZKTd6PhxR6oNqk12RIHrYdPpmc-kPbyk-S6fmEDI9w";
  const q=(standard,skillId,sourceDocumentId,firstTaughtDay,questionParams=null)=>({standard,skillId,sourceDocumentId,firstTaughtDay,questionParams});
  window.DW_MORNING_BENCHMARKS={
    version:"q1-pacing-az-v1",
    forms:{
      I:{
        gradeLevel:4,
        title:"Grade 4 • Q1 Learning Benchmark",
        math:[
          q("4.NBT.A.1","math.placevalue",math4,3),
          q("4.NBT.A.1","math.placevalue",math4,5),
          q("4.NBT.A.2","math.write.multidigit",math4,7),
          q("4.NBT.A.2","math.compare.whole",math4,9),
          q("4.NBT.A.3","math.rounding",math4,11),
          q("4.NBT.A.3","math.rounding",math4,13),
          q("4.NBT.B.4","math.add.multi",math4,15),
          q("4.NBT.B.4","math.sub.multi",math4,17),
          q("4.OA.A.3","math.wordproblems",math4,20,{multiStep:true}),
          q("4.OA.A.3","math.wordproblems",math4,22,{multiStep:true}),
          q("4.G.A.1","math.geom.lines",math4,25),
          q("4.G.A.1","math.geom.parallel",math4,27),
          q("4.G.A.2","math.geom.polygons",math4,29),
          q("4.G.A.3","math.symmetry",math4,33),
          q("4.MD.C.5-6","math.angle.measure",math4,36)
        ],
        ela:[
          q("4.RL.3","ela.character",hum4,3),
          q("4.RL.3","ela.character",hum4,5),
          q("4.RL.7","ela.pk.comparing_and_contrasting",hum4,8),
          q("4.L.2a","ela.capitalization",hum4,3),
          q("4.L.2b","ela.dialogue",hum4,10),
          q("4.L.2c","ela.pk.commas_in_a_series",hum4,8),
          q("4.W.1","ela.opinion",hum4,8),
          q("4.W.1b","ela.opinion",hum4,11),
          q("4.RL.6","ela.pov",hum4,13),
          q("4.RL.6","ela.pov",hum4,15),
          q("4.RL.1","ela.supporting",hum4,18),
          q("4.RL.1","ela.meaning",hum4,20),
          q("4.L.4b","curric.morph",hum4,3,{root:"form",word:"format"}),
          q("4.L.4b","curric.morph",hum4,13,{root:"scrib/script",word:"description"}),
          q("4.L.1f","ela.sent.three",hum4,18)
        ]
      },
      K:{
        gradeLevel:5,
        title:"Grade 5 • Q1 Learning Benchmark",
        math:[
          q("5.NBT.A.1","math.placevalue",math5,3),
          q("5.NBT.A.1","math.placevalue",math5,5),
          q("5.NBT.A.2","math.pk.multiplying_a_decimal_by_a_power_of_ten",math5,8),
          q("5.NBT.A.2","math.pk.dividing_by_powers_of_ten",math5,11),
          q("5.NBT.A.3a","math.dec.wordform",math5,13),
          q("5.NBT.A.3a","math.dec.expanded",math5,15),
          q("5.NBT.A.3b","math.dec.compare",math5,17),
          q("5.NBT.A.3b","math.dec.order",math5,19),
          q("5.NBT.A.4","math.pk.rounding_decimals",math5,20),
          q("5.NBT.A.4","math.pk.rounding_decimals",math5,23),
          q("5.NBT.B.7","math.dec.add",math5,25),
          q("5.NBT.B.7","math.dec.sub",math5,27),
          q("5.NBT.B.7","math.pk.multiplying_a_decimal_by_a_one_digit_number",math5,29),
          q("5.NBT.B.7","math.pk.division_with_decimal_quotients",math5,31),
          q("5.G.B.3","math.pk.classifying_quadrilaterals",math5,35)
        ],
        ela:[
          q("5.RL.3","ela.character",hum5,3),
          q("5.RL.3","ela.pk.comparing_and_contrasting",hum5,5),
          q("5.RL.7","ela.pk.comparing_and_contrasting",hum5,8),
          q("5.W.1","ela.opinion",hum5,8),
          q("5.L.2a","ela.pk.commas_in_a_series",hum5,3),
          q("5.L.2b","ela.commas",hum5,5),
          q("5.L.2d","ela.capitalization.titles",hum5,8),
          q("5.RL.5","ela.pk.text_structures",hum5,13),
          q("5.L.3a","ela.pk.combining_sentences",hum5,15),
          q("5.L.3a","ela.pk.reducing_sentences",hum5,16),
          q("5.RL.1","ela.supporting",hum5,18),
          q("5.RL.1","ela.meaning",hum5,20),
          q("5.L.4b","curric.morph",hum5,3,{root:"cede/cess/ceed",word:"conceded"}),
          q("5.L.4b","curric.morph",hum5,13,{root:"fer",word:"transfer"}),
          q("5.L.3b","ela.register",hum5,23)
        ]
      }
    },
    officialStandards:{
      math:"https://www.azed.gov/standards-practices/k-12standards/mathematics-standards",
      ela:"https://www.azed.gov/standards-practices/k-12standards/english-language-arts-standards"
    }
  };
})();
