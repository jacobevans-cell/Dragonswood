(function installDay24PlusVideoMap(){
  "use strict";
  const additions={
  "1zSgLZMZ7oAWpO-_x_m2oB0oubZo5EFeVZBsfktJ8G8I": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D24%20-%20-%20HUM%20I%20Q1%20Lesson%2024%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "I - 4th/Reading/D24 - - HUM I Q1 Lesson 24– Reading Comprehension — Characters and Setting.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 24,
    "lesson": "* HUM I Q1 Lesson 24– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "1Bok9-cF4sz8cJvfp6eHXyRYmVvOP5GrzgiW55MAvk54": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D24%20-%20-HUM%20I%20Q1%20Lesson%2024%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20stretching%20sentences.mp4",
    "r2Key": "I - 4th/Writing/D24 - -HUM I Q1 Lesson 24 – Writing and Language — stretching sentences.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 25,
    "lesson": "*HUM I Q1 Lesson 24 – Writing and Language — stretching sentences",
    "durationSeconds": 0
  },
  "1m-4jSeMgBR6YopLb9TTRibmnqq7mIK05n-ZMz7NQgfw": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D25%20-%20-%20HUM%20I%20Q1%20Lesson%2025%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "I - 4th/Reading/D25 - - HUM I Q1 Lesson 25– Reading Comprehension — Characters and Setting.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 25,
    "lesson": "* HUM I Q1 Lesson 25– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "11hdo0y_SpAcwE8s5nDhw2QK6NYsLPpg0PJKjOixamXM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D26%20-%20-HUM%20I%20Q1%20Lesson%2026%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "I - 4th/Reading/D26 - -HUM I Q1 Lesson 26– Reading Comprehension — Characters and Setting.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 26,
    "lesson": "*HUM I Q1 Lesson 26– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "1wO-FB5rD83TpLQWGiwC5Bk5XjmLXZ5UToK6pppP9184": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D26%20-%20-HUM%20I%20Q1%20Lesson%2026%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20stretching%20sentences.mp4",
    "r2Key": "I - 4th/Writing/D26 - -HUM I Q1 Lesson 26 – Writing and Language — stretching sentences.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 26,
    "lesson": "*HUM I Q1 Lesson 26 – Writing and Language — stretching sentences",
    "durationSeconds": 0
  },
  "1GGTWBbhNzHKl5uRnQ6nSSko9d5kJM-dBmEstUvqPbVI": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D28%20-%20-HUM%20I%20Q1%20Lesson%2028%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "I - 4th/Reading/D28 - -HUM I Q1 Lesson 28– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 28,
    "lesson": "*HUM I Q1 Lesson 28– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1qfoax9cA5vaNW73yIMSn1IKBAzh4cMo-HdbMnUWL278": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D28%20-%20-HUM%20I%20Q1%20Lesson%2028%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20title.mp4",
    "r2Key": "I - 4th/Writing/D28 - -HUM I Q1 Lesson 28 – Writing and Language — title.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 28,
    "lesson": "*HUM I Q1 Lesson 28 – Writing and Language — title",
    "durationSeconds": 0
  },
  "1-2Bk8a-dvEVGdieZzeUA_J1dKnwVY4ia0av_SNIxbvU": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D29%20-%20-HUM%20I%20Q1%20Lesson%2029%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "I - 4th/Reading/D29 - -HUM I Q1 Lesson 29– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 29,
    "lesson": "*HUM I Q1 Lesson 29– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1bUQm_uoUID2WPU5IA1gexCvv-DVY0DkWvkLpXeipU38": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D29%20-%20-HUM%20K%20Q1%20Lesson%2029%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "I - 4th/Writing/D29 - -HUM K Q1 Lesson 29 – Writing and Language — Titles.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 29,
    "lesson": "*HUM K Q1 Lesson 29 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "1ZUXeXgy02O8XoVSsSS4MJNBcteUVwos9c6Lfp_kmY1Y": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D30%20-%20-HUM%20I%20Q1%20Lesson%2030%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "I - 4th/Reading/D30 - -HUM I Q1 Lesson 30– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 30,
    "lesson": "*HUM I Q1 Lesson 30– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "11KBU2tohlap52Ex0SfOTsji4k-x_c8R52OOQBW7-9V0": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D30%20-%20-HUM%20K%20Q1%20Lesson%2030%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "I - 4th/Writing/D30 - -HUM K Q1 Lesson 30 – Writing and Language — Titles.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 30,
    "lesson": "*HUM K Q1 Lesson 30 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "1x8kTqJUNczAMYoBdqjA5ONjFLGpKb0ZdEVYS063v2io": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D31%20-%20-HUM%20I%20Q1%20Lesson%2031%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "I - 4th/Reading/D31 - -HUM I Q1 Lesson 31– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 31,
    "lesson": "*HUM I Q1 Lesson 31– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1siuobF0T5GIfbBq3NErWCZLN5STys6fb7HjaaXTSbRQ": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D31%20-%20-HUM%20K%20Q1%20Lesson%2031%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "I - 4th/Writing/D31 - -HUM K Q1 Lesson 31 – Writing and Language — Titles.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 31,
    "lesson": "*HUM K Q1 Lesson 31 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "1OT8dS4P0ioqi56ho32r1K6ax4lOfR2_6BLKIsk2yXLg": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D33%20-%20-HUM%20I%20Q1%20Lesson%2033%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "I - 4th/Reading/D33 - -HUM I Q1 Lesson 33– Reading Comprehension — inferencing.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 33,
    "lesson": "*HUM I Q1 Lesson 33– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1tOcHaPUtG--d60dLa5NzovSEs8m9nRnIfhnK51pN2NU": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D33%20-%20-HUM%20I%20Q1%20Lesson%2033%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "I - 4th/Writing/D33 - -HUM I Q1 Lesson 33 – Writing and Language — opinion writing.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 33,
    "lesson": "*HUM I Q1 Lesson 33 – Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1AnnsYJfjVhg53-_GrRxjLMPVYYwApNySC-m0MV-IT0Q": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D34%20-%20-HUM%20I%20Q1%20Lesson%2034%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "I - 4th/Reading/D34 - -HUM I Q1 Lesson 34– Reading Comprehension — inferencing.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 34,
    "lesson": "*HUM I Q1 Lesson 34– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1UP7CcmOG0TN4ags41M_XXVfYLiv0q-9MotPWw9SjVOM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D34%20-%20-HUM%20I%20Q1%20Lesson%2034%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "I - 4th/Writing/D34 - -HUM I Q1 Lesson 34 – Writing and Language — opinion writing.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 34,
    "lesson": "*HUM I Q1 Lesson 34 – Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1fvKYUxWHCSAAWrIZGHerCBvHLvERfyI7Iv2xs5URjiA": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D35%20-%20-HUM%20I%20Q1%20Lesson%2035%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "I - 4th/Reading/D35 - -HUM I Q1 Lesson 35– Reading Comprehension — inferencing.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 35,
    "lesson": "*HUM I Q1 Lesson 35– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1cxmthVXuO9Kmix84rMVokrAKG_6iofM9JRJWzvWA8Js": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D35%20-%20-HUM%20I%20Q1%20Lesson%2035%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "I - 4th/Writing/D35 - -HUM I Q1 Lesson 35 – Writing and Language — opinion writing.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 35,
    "lesson": "*HUM I Q1 Lesson 35 – Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1v5WhwRN3XOFoULkAXoJYTpnI2Cv4lSp0aOeJ6TE9DTM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Reading/D36%20-%20-HUM%20I%20Q1%20Lesson%2036%20%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "I - 4th/Reading/D36 - -HUM I Q1 Lesson 36 – Reading Comprehension — inferencing.mp4",
    "grade": "I",
    "subject": "Reading",
    "day": 36,
    "lesson": "*HUM I Q1 Lesson 36 – Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "19PpNMjPZxuRLfXb_W_uvfqwTLAqw8WXLSZOCKphzKqI": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Writing/D36%20-%20-HUM%20I%20Q1%20Lesson%2036%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "I - 4th/Writing/D36 - -HUM I Q1 Lesson 36 – Writing and Language — opinion writing.mp4",
    "grade": "I",
    "subject": "Writing",
    "day": 36,
    "lesson": "*HUM I Q1 Lesson 36 – Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "16y9IhLiwnQrSTzO1OAk_OX_aBYB9IChhNBtISODJo-Q": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D24%20-%20-%20HUMK%20Q1%20Lesson%2024%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "K - 5th/Reading/D24 - - HUMK Q1 Lesson 24– Reading Comprehension — Characters and Setting.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 24,
    "lesson": "*  HUMK Q1 Lesson 24– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "13f9jDltzTQaCfAKMsivW0aoRxfM09CX9uy12u2yW9BM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D24%20-%20-HUM%20K%20Q1%20Lesson%2024%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20stretching%20sentences.mp4",
    "r2Key": "K - 5th/Writing/D24 - -HUM K Q1 Lesson 24 – Writing and Language — stretching sentences.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 24,
    "lesson": "*HUM K Q1 Lesson 24 – Writing and Language — stretching sentences",
    "durationSeconds": 0
  },
  "1EhgFXXYAqxgq2j-8vJj7DOQuTdfyTmuGF3rZ6MKjMSk": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D25%20-%20-%20HUM%20K%20Q1%20Lesson%2025%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "K - 5th/Reading/D25 - - HUM K Q1 Lesson 25– Reading Comprehension — Characters and Setting.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 25,
    "lesson": "* HUM K Q1 Lesson 25– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "1xHf9sSYhrDNCnWueGSJVE1XMHHpIOhdP-AZzQAM1YKo": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D25%20-%20-HUM%20K%20Q1%20Lesson%2025%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20stretching%20sentences.mp4",
    "r2Key": "K - 5th/Writing/D25 - -HUM K Q1 Lesson 25 – Writing and Language — stretching sentences.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 25,
    "lesson": "*HUM K Q1 Lesson 25 – Writing and Language — stretching sentences",
    "durationSeconds": 0
  },
  "1T8n5gGtEXJiJxOrAGo3CRzrsWTiQbZUN4nvWIQ9mSYk": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D26%20-%20-%20HUM%20K%20Q1%20Lesson%2026%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Characters%20and%20Setting.mp4",
    "r2Key": "K - 5th/Reading/D26 - - HUM K Q1 Lesson 26– Reading Comprehension — Characters and Setting.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 26,
    "lesson": "* HUM K Q1 Lesson 26– Reading Comprehension — Characters and Setting",
    "durationSeconds": 0
  },
  "1HSVzGwFtwjZ5UmFYJ30PbdN5mZbKePQsQjEcewZG7xs": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D26%20-%20-HUM%20K%20Q1%20Lesson%2026%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20stretching%20sentences.mp4",
    "r2Key": "K - 5th/Writing/D26 - -HUM K Q1 Lesson 26 – Writing and Language — stretching sentences.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 26,
    "lesson": "*HUM K Q1 Lesson 26 – Writing and Language — stretching sentences",
    "durationSeconds": 0
  },
  "1OcfHowrqTwx_ef5cj8n5vfWTs_uQEdKYo3GSWN7XA_0": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D28%20-%20-HUM%20K%20Q1%20Lesson%2028%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "K - 5th/Reading/D28 - -HUM K Q1 Lesson 28– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 28,
    "lesson": "*HUM K Q1 Lesson 28– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1NkYagVUuAR0eB2XMR3AsSPjeIbtkGXmyp0qai4G3lYo": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D28%20-%20-HUM%20K%20Q1%20Lesson%2028%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "K - 5th/Writing/D28 - -HUM K Q1 Lesson 28 – Writing and Language — Titles.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 28,
    "lesson": "*HUM K Q1 Lesson 28 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "10FArQyxYrUsjd8wa1Icj9suXqQ1aCUoF_AmacCF2XvU": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D29%20-%20-HUM%20K%20Q1%20Lesson%2029%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "K - 5th/Reading/D29 - -HUM K Q1 Lesson 29– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 29,
    "lesson": "*HUM K Q1 Lesson 29– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "168mgDeGRadQMfdGWRALT8pB8E4u8HMoO2zUjYwWwZuU": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D29%20-%20-HUM%20K%20Q1%20Lesson%2029%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "K - 5th/Writing/D29 - -HUM K Q1 Lesson 29 – Writing and Language — Titles.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 29,
    "lesson": "*HUM K Q1 Lesson 29 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "1ZqrrJ8pbkMwTtaxxmljqxvcWtxwRZpmT_L9TEUWxlGM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D30%20-%20-HUM%20K%20Q1%20Lesson%2030%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "K - 5th/Reading/D30 - -HUM K Q1 Lesson 30– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 30,
    "lesson": "*HUM K Q1 Lesson 30– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1bUTxqu1hthRqn2q-clWXTqmpbvM-Y59xgm7fRTvsyJA": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D30%20-%20-HUM%20K%20Q1%20Lesson%2030%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "K - 5th/Writing/D30 - -HUM K Q1 Lesson 30 – Writing and Language — Titles.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 30,
    "lesson": "*HUM K Q1 Lesson 30 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "17z9LliAS38kmzIZ_9PGMD9uMKdNxAR2EEU-iextLM_0": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D31%20-%20-HUM%20K%20Q1%20Lesson%2031%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20Compare%20and%20Contrast.mp4",
    "r2Key": "K - 5th/Reading/D31 - -HUM K Q1 Lesson 31– Reading Comprehension — Compare and Contrast.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 31,
    "lesson": "*HUM K Q1 Lesson 31– Reading Comprehension — Compare and Contrast",
    "durationSeconds": 0
  },
  "1uwscL-Fj9gUou9wYouYqP5YFFyts3OzSwQGI5BjVCfM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D31%20-%20-HUM%20K%20Q1%20Lesson%2031%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Titles.mp4",
    "r2Key": "K - 5th/Writing/D31 - -HUM K Q1 Lesson 31 – Writing and Language — Titles.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 31,
    "lesson": "*HUM K Q1 Lesson 31 – Writing and Language — Titles",
    "durationSeconds": 0
  },
  "1RlLH6DfJhiKClSwVbSFOdwUje2f4ki9-jjFTLC-OUFk": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D33%20-%20-HUM%20K%20Q1%20Lesson%2033%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "K - 5th/Reading/D33 - -HUM K Q1 Lesson 33– Reading Comprehension — inferencing.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 33,
    "lesson": "*HUM K Q1 Lesson 33– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1sg39maxXaBttYGSrDOmNSst6mj--Tq2Y562oWEjkfUI": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D33%20-%20-HUM%20K%20Q1%20Lesson%2031%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20Opinion%20Writing.mp4",
    "r2Key": "K - 5th/Writing/D33 - -HUM K Q1 Lesson 31 – Writing and Language — Opinion Writing.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 33,
    "lesson": "*HUM K Q1 Lesson 31 – Writing and Language — Opinion Writing",
    "durationSeconds": 0
  },
  "1A_FDyxHPceXlAD6UgHML1-rbM7ON59P9X7LhYi5y71w": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D34%20-%20-HUM%20K%20Q1%20Lesson%2034%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "K - 5th/Reading/D34 - -HUM K Q1 Lesson 34– Reading Comprehension — inferencing.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 34,
    "lesson": "*HUM K Q1 Lesson 34– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1Vr15nR6URZ2fx0aqImKbydNx-iPael-pZ_kCzWtFsDs": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D34%20-%20-HUM%20K%20Q1%20Lesson%2034%20%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "K - 5th/Writing/D34 - -HUM K Q1 Lesson 34 – Writing and Language — opinion writing.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 34,
    "lesson": "*HUM K Q1 Lesson 34 – Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1bpUq78bUsGBXPollgs8Jlni1iKLtNV4SNuDbOiV4ZtY": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D35%20-%20-HUM%20K%20Q1%20Lesson%2035%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "K - 5th/Reading/D35 - -HUM K Q1 Lesson 35– Reading Comprehension — inferencing.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 35,
    "lesson": "*HUM K Q1 Lesson 35– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1W1uM9ZNroXD5bp3ejr5AVz630jBATR9m77Q8m75y5rQ": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D35%20-%20-HUM%20K%20Q1%20Lesson%2035%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "K - 5th/Writing/D35 - -HUM K Q1 Lesson 35– Writing and Language — opinion writing.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 35,
    "lesson": "*HUM K Q1 Lesson 35– Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1zkpxtdstqYVbYzIOR3kT2vC-7Ss1u01pyM2uK5CEDVQ": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Reading/D36%20-%20-HUM%20K%20Q1%20Lesson%2036%E2%80%93%20Reading%20Comprehension%20%E2%80%94%20inferencing.mp4",
    "r2Key": "K - 5th/Reading/D36 - -HUM K Q1 Lesson 36– Reading Comprehension — inferencing.mp4",
    "grade": "K",
    "subject": "Reading",
    "day": 36,
    "lesson": "*HUM K Q1 Lesson 36– Reading Comprehension — inferencing",
    "durationSeconds": 0
  },
  "1hse-znNt4YSGGfM4YwdvFSk4x3Sj9qPLtzWIQIlsJVE": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/K%20-%205th/Writing/D36%20-%20-HUM%20K%20Q1%20Lesson%2036%E2%80%93%20Writing%20and%20Language%20%E2%80%94%20opinion%20writing.mp4",
    "r2Key": "K - 5th/Writing/D36 - -HUM K Q1 Lesson 36– Writing and Language — opinion writing.mp4",
    "grade": "K",
    "subject": "Writing",
    "day": 36,
    "lesson": "*HUM K Q1 Lesson 36– Writing and Language — opinion writing",
    "durationSeconds": 0
  },
  "1PxA_rk04QHxSdP0YLtlj5QkaW9EyuknN3uhzDSXGn4w": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Math/D26%20-%20STEM%20I%20Q1%20Lesson%2020-Math-Rays%20and%20Segments.mp4",
    "r2Key": "I - 4th/Math/D26 - STEM I Q1 Lesson 20-Math-Rays and Segments.mp4",
    "grade": "I",
    "subject": "Math",
    "day": 26,
    "lesson": "STEM I Q1 Lesson 20-Math-Rays and Segments",
    "durationSeconds": 0
  },
  "1mMHIXjbOGUrSbVNx8SaDnzVYlIhooyE-C2C0pndkBMM": {
    "status": "ready",
    "url": "https://pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev/I%20-%204th/Math/D29%20-%20STEM%20I%20Q1%20Lesson%2023-Math-Classify%20Shapes.mp4",
    "r2Key": "I - 4th/Math/D29 - STEM I Q1 Lesson 23-Math-Classify Shapes.mp4",
    "grade": "I",
    "subject": "Math",
    "day": 29,
    "lesson": "STEM I Q1 Lesson 23-Math-Classify Shapes",
    "durationSeconds": 0
  }
};
  window.DRAGONSWOOD_VIDEO_MAP=Object.assign(window.DRAGONSWOOD_VIDEO_MAP||{},additions);
})();
