"use strict";

// Deployment entry point for the OpenAI academic grader only.
// This deliberately excludes Azure narration parameter registration.
process.env.DRAGONSWOOD_GRADING_ONLY="1";
module.exports=require("./index");
