(function installPlacementBenchmarkData(){
  "use strict";
  const AZ_MATH="https://www.azed.gov/standards-practices/k-12standards/mathematics-standards";
  const AZ_ELA="https://www.azed.gov/standards-practices/k-12standards/english-language-arts-standards";
  const q=(standard,skillId,placementLevel,questionParams=null)=>({standard,skillId,placementLevel,questionParams});
  window.DW_PLACEMENT_BENCHMARK={
    version:"math-ela-placement-v1",
    title:"Math & ELA Skills Placement",
    questionsPerSubject:20,
    levels:["foundation","4","5","6"],
    officialStandards:{math:AZ_MATH,ela:AZ_ELA},
    math:[
      q("2.NBT.B.5","math.addsub.mixed","foundation",{digits:2}),
      q("3.OA.C.7","math.mult.facts","foundation"),
      q("3.NBT.A.2","math.addsub.mixed","foundation",{digits:3}),
      q("3.NF.A.3","math.frac.equiv","foundation"),
      q("3.MD.C.7","math.area","foundation"),
      q("4.NBT.A.2","math.placevalue","4"),
      q("4.NBT.A.3","math.rounding","4"),
      q("4.NBT.B.4","math.add.multi","4"),
      q("4.NBT.B.5","math.mult.3x1","4"),
      q("4.NF.A.1","math.frac.equiv","4"),
      q("5.NBT.A.1","math.placevalue","5"),
      q("5.NBT.A.3b","math.dec.compare","5"),
      q("5.NBT.B.5","math.mult.3x2","5"),
      q("5.NBT.B.7","math.dec.add","5"),
      q("5.NF.B.4","math.frac.xwhole","5"),
      q("6.NS.C.5","math.integers","6"),
      q("6.EE.A.1","math.oporder","6"),
      q("6.RP.A.3c","math.percent","6"),
      q("6.NS.C.6","math.pk.coordinate_plane_all_four_quadrants","6"),
      q("6.NS.A.1","math.pk.dividing_two_fractions","6")
    ],
    ela:[
      q("2.RL.1","ela.supporting","foundation"),
      q("2.L.1","ela.sent.three","foundation"),
      q("2.L.2","ela.capitalization","foundation"),
      q("3.RL.3","ela.character","foundation"),
      q("3.L.4a","ela.meaning","foundation"),
      q("4.RL.1","ela.supporting","4"),
      q("4.RL.3","ela.character","4"),
      q("4.RL.6","ela.pov","4"),
      q("4.L.1f","ela.sent.three","4"),
      q("4.L.4a","ela.meaning","4"),
      q("5.RL.1","ela.supporting","5"),
      q("5.RL.3","ela.character","5"),
      q("5.RL.6","ela.pov","5"),
      q("5.L.1","ela.verbs.agreement","5"),
      q("5.L.4a","ela.meaning","5"),
      q("6.RL.1","ela.pk.comparing_and_contrasting","6"),
      q("6.RL.4","ela.connotation","6"),
      q("6.RI.5","ela.pk.text_structures","6"),
      q("6.L.1","ela.pk.identifying_dependent_clauses","6"),
      q("6.L.3","ela.register","6")
    ]
  };
})();
