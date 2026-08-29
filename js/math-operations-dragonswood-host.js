(() => {
  'use strict';

  const FIREBASE_VERSION = '12.1.0';
  const DAILY_XP_CAP = 150;
  const XP_THRESHOLDS = [0,200,450,750,1100,1500,1950,2450,3000,3600,4250,4950,5700,6500,7350,8250,9200,10200,11100,12000];
  const firebaseConfig = {
    apiKey: 'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE',
    authDomain: 'dragonswood-9289e.firebaseapp.com',
    projectId: 'dragonswood-9289e',
    storageBucket: 'dragonswood-9289e.firebasestorage.app',
    messagingSenderId: '1064477064695',
    appId: '1:1064477064695:web:283e1016ee2303d39042f2',
    measurementId: 'G-LPRLDGVBD2'
  };

  function localDateKey(){
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function levelFromXp(value){
    const xp = Math.max(0, Number(value || 0));
    let level = 1;
    for(let i=0;i<XP_THRESHOLDS.length;i++) if(xp >= XP_THRESHOLDS[i]) level = i+1;
    return Math.min(20, level);
  }

  const DRAGONSWOOD_DAILY_GOLD_CAP=30;
function mathOpsGoldWindow(profile){const raw=profile?.dailyGoldWindowStartedAt,start=raw?.toMillis?.()||Number(raw?.seconds||0)*1000||0,reset=!start||Date.now()-start>=86400000;return{earned:reset?0:Math.max(0,Math.min(DRAGONSWOOD_DAILY_GOLD_CAP,Number(profile?.dailyGoldEarned||0))),reset}}
function dailyXpForProfile(profile){
    if(String(profile?.dailyXpDate || '') !== localDateKey()) return 0;
    return Math.max(0, Math.min(DAILY_XP_CAP, Number(profile?.dailyXpEarned || 0)));
  }

  window.DRAGONSWOOD_MATH_CONFIG_READY = (async () => {
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
    ]);

    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    const db = firestoreMod.getFirestore(app);

    let currentUser = null;
    let currentProfile = null;
    let claimInFlight = false;

    const authReady = new Promise(resolve => {
      let settled = false;
      const unsubscribe = authMod.onAuthStateChanged(auth, user => {
        currentUser = user || null;
        if(!settled){
          settled = true;
          unsubscribe();
          resolve(currentUser);
        }
      });
      setTimeout(() => {
        if(!settled){
          settled = true;
          unsubscribe();
          resolve(auth.currentUser || null);
        }
      }, 5000);
    });

    async function loadProfile(){
      const user = currentUser || auth.currentUser || await authReady;
      currentUser = user || null;
      if(!user) return null;
      const snap = await firestoreMod.getDoc(firestoreMod.doc(db,'students',user.uid));
      if(!snap.exists()) return null;
      currentProfile = snap.data();
      return currentProfile;
    }

    function publicProfile(profile = currentProfile){
      if(!profile) return null;
      const daily = dailyXpForProfile(profile);
      const name = profile.firstName || profile.displayName || currentUser?.displayName || currentUser?.email || 'Dragonswood Adventurer';
      return {
        displayName: name,
        level: levelFromXp(profile.xp),
        xp: Number(profile.xp || 0),
        gold: Number(profile.gold || 0),
        dailyXpRemaining: Math.max(0, DAILY_XP_CAP - daily),
        knockedOut: Number(profile.hp || 0) <= 0
      };
    }

    const rewardService = {
      async getProfile(){
        const profile = await loadProfile();
        return publicProfile(profile);
      },

      async claimMathQuest(result = {}){
        if(claimInFlight) throw new Error('A math reward claim is already being saved.');
        claimInFlight = true;
        try{
          const user = currentUser || auth.currentUser || await authReady;
          if(!user) throw new Error('No signed-in Dragonswood student was found. Open the quest from the signed-in student portal.');
          currentUser = user;

          const latestSnap = await firestoreMod.getDoc(firestoreMod.doc(db,'students',user.uid));
          if(!latestSnap.exists()) throw new Error('Your Dragonswood character profile could not be found.');
          const profile = latestSnap.data();
          currentProfile = profile;

          if(Number(profile.hp || 0) <= 0){
            return {
              message: '💀 Practice complete • no XP or Gold while knocked out.',
              statusText: 'Your math round is complete, but knocked-out adventurers cannot earn account rewards until revival.',
              profile: publicProfile(profile)
            };
          }

          const accuracy = Math.max(0, Math.min(1, Number(result.accuracy || 0)));
          const requestedXp = Math.max(5, Math.min(12, Number(result.playerXpEarned || 5)));
          const rawRewardGold = Math.max(1, Math.min(2, 1 + (accuracy >= 0.90 && Number(result.hintsUsed || 0) === 0 ? 1 : 0)));
          const goldWindow=mathOpsGoldWindow(profile),rewardGold=Math.min(rawRewardGold,Math.max(0,DRAGONSWOOD_DAILY_GOLD_CAP-goldWindow.earned));
          const dailyBefore = dailyXpForProfile(profile);
          const dailyRemaining = Math.max(0, DAILY_XP_CAP - dailyBefore);
          const xpAward = Math.min(requestedXp, dailyRemaining);
          const oldXp = Number(profile.xp || 0);
          const oldGold = Number(profile.gold || 0);
          const dateKey = localDateKey();
          const runId = String(result.runId || 'legacy').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,48) || 'legacy';
          const claimId = `${user.uid}_math_operations_${dateKey}_${runId}_r${Math.max(1,Math.min(3,Number(result.round||1)))}`;
          const claimRef = firestoreMod.doc(db,'gameResults',claimId);
          const priorClaim = await firestoreMod.getDoc(claimRef);
          if(priorClaim.exists()) return {message:'🐉 This round reward was already saved.',statusText:'This completed round has already claimed its Dragonswood reward. No duplicate XP or Gold was added.',profile:publicProfile(profile)};

          const batch = firestoreMod.writeBatch(db);
          batch.set(claimRef, {
            studentId: user.uid,
            studentEmail: user.email || '',
            gameId: 'math_operations_quest',
            gameName: 'Math Operations Quest',
            status: 'complete',
            dateKey,
            problemsSolved: Number(result.solved || 0),
            roundSolved: Number(result.roundSolved || 0),
            round: Number(result.round || 1),
            roundScore: Number(result.roundScore || 0),
            accuracy: Math.round(accuracy * 100),
            hintsUsed: Number(result.hintsUsed || 0),
            totalAttempts: Number(result.totalAttempts || 0),
            correctAttempts: Number(result.correctAttempts || 0),
            practiceMode: String(result.practiceMode || 'random'),
            difficulty: String(result.difficulty || 'normal'),
            questPointMultiplier: Number(result.questPointMultiplier || 1),
            selectedOperation: String(result.selectedOperation || 'mixed'),
            operationCounts: result.operationCounts || {},
            xpAward,
            goldAward: rewardGold,
            createdAt: firestoreMod.serverTimestamp()
          });

          batch.update(firestoreMod.doc(db,'students',user.uid), {
            xp: oldXp + xpAward,
            gold: oldGold + rewardGold,
            dailyXpDate: dateKey,
            dailyXpEarned: dailyBefore + xpAward,
            dailyGoldEarned: goldWindow.earned + rewardGold,
            dailyGoldWindowStartedAt: goldWindow.reset ? firestoreMod.serverTimestamp() : profile.dailyGoldWindowStartedAt,
            lastGameClaimId: claimId,
            updatedAt: firestoreMod.serverTimestamp()
          });

          await batch.commit();
          currentProfile = {
            ...profile,
            xp: oldXp + xpAward,
            gold: oldGold + rewardGold,
            dailyXpDate: dateKey,
            dailyXpEarned: dailyBefore + xpAward,
            dailyGoldEarned: goldWindow.earned + rewardGold,
            dailyGoldWindowStartedAt: profile.dailyGoldWindowStartedAt,
            lastGameClaimId: claimId
          };

          return {
            message: xpAward > 0
              ? `🐉 DRAGONSWOOD REWARD: +${xpAward} XP • +${rewardGold} Gold`
              : `🐉 DAILY XP CAP REACHED • +${rewardGold} Gold`,
            statusText: xpAward > 0
              ? `Saved! +${xpAward} Player XP and +${rewardGold} Gold. Daily XP: ${dailyBefore + xpAward}/${DAILY_XP_CAP}.`
              : `Saved! You are already at the ${DAILY_XP_CAP} Player XP daily cap. This round still awarded +${rewardGold} Gold.`,
            profile: publicProfile(currentProfile)
          };
        } finally {
          claimInFlight = false;
        }
      }
    };

    window.DRAGONSWOOD_MATH_CONFIG = {
      environment: 'production',
      allowLiveWrites: true,
      rewardService
    };
    window.DragonswoodMathRewardService = rewardService;
    window.dispatchEvent(new CustomEvent('dragonswood-math-host-ready'));
    return window.DRAGONSWOOD_MATH_CONFIG;
  })().catch(error => {
    console.error('Dragonswood Math host bridge failed to initialize', error);
    window.DRAGONSWOOD_MATH_CONFIG = {
      environment: 'production',
      allowLiveWrites: false,
      hostError: String(error?.message || error || 'Unknown host error')
    };
    window.dispatchEvent(new CustomEvent('dragonswood-math-host-ready'));
    return window.DRAGONSWOOD_MATH_CONFIG;
  });
})();
