(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const status = $('dwStatus');
  const account = $('dwAccount');
  const badge = $('environmentBadge');
  const loot = $('dwLoot');
  const level = $('dwLevel');
  const xp = $('dwAccountXp');
  const gold = $('dwGold');
  const reward = $('dwDailyReward');

  let config = {};
  let environment = 'preview';
  let service = null;
  let liveEnabled = false;

  function refreshConfig(){
    config = window.DRAGONSWOOD_MATH_CONFIG || {};
    environment = String(config.environment || 'preview').toLowerCase();
    service = config.rewardService || window.DragonswoodMathRewardService || null;
    liveEnabled = environment === 'production' && !!service && config.allowLiveWrites === true;
  }

  function setStatus(text, type = 'preview') {
    if (!status) return;
    status.textContent = text;
    status.className = `dw-status ${type}`.trim();
  }

  function setBadge(text, type = 'preview') {
    if (!badge) return;
    badge.textContent = text;
    badge.dataset.environment = type;
  }

  function renderProfile(profile) {
    if (!profile) return;
    if (level) level.textContent = profile.level ?? '—';
    if (xp) xp.textContent = Number(profile.xp || 0).toLocaleString();
    if (gold) gold.textContent = Number(profile.gold || 0).toLocaleString();
    if (account) account.textContent = profile.displayName
      ? `Connected as ${profile.displayName}`
      : 'Connected to Dragonswood';
    if (reward) reward.textContent = profile.knockedOut
      ? 'No rewards while knocked out'
      : profile.dailyXpRemaining === 0 ? 'Gold only today' : '5–12 XP + 1–2 Gold';
  }

  async function waitForHost(){
    try {
      if(window.DRAGONSWOOD_MATH_CONFIG_READY && typeof window.DRAGONSWOOD_MATH_CONFIG_READY.then === 'function'){
        await window.DRAGONSWOOD_MATH_CONFIG_READY;
      }
    } catch (error) {
      console.error('Math host readiness failed', error);
    }
    refreshConfig();
  }

  async function initialize() {
    await waitForHost();

    if (!service) {
      if(environment === 'production'){
        setBadge('REWARD LEDGER UNAVAILABLE', 'production');
        if(config.hostError)console.warn('[Math rewards connection]',config.hostError);
        setStatus('The reward ledger cannot be reached. Math practice still works, but rewards will not be recorded yet.', 'error');
        if (account) account.textContent = 'Reward ledger unavailable';
        if (reward) reward.textContent = 'Practice only';
      }else{
        setBadge('PREVIEW • LIVE REWARDS OFF', 'preview');
        setStatus('Preview mode. Practice works normally, but this page cannot change a student account until a Dragonswood reward service is intentionally connected.', 'preview');
        if (account) account.textContent = 'Preview mode • no live account changes';
        if (reward) reward.textContent = 'Preview only';
      }
      return;
    }

    if (environment === 'staging') {
      setBadge('STAGING • TEST DATA ONLY', 'staging');
      setStatus('Connected to Dragonswood staging. Test rewards may save only to staging data.', 'good');
    } else if (liveEnabled) {
      setBadge('PRODUCTION • LIVE REWARDS ON', 'production');
      setStatus('Connected to Dragonswood. Normal and Hard round rewards can save to the signed-in student account; Easy remains practice-only.', 'good');
    } else {
      setBadge('SAFE MODE • WRITES OFF', 'preview');
      setStatus('A reward service is available, but live writes are disabled. Practice results will not change accounts.', 'preview');
    }

    try {
      const profile = typeof service.getProfile === 'function' ? await service.getProfile() : null;
      if(profile){
        renderProfile(profile);
      }else{
        if(account) account.textContent = 'Not signed in to Dragonswood';
        setStatus('Open this quest from your signed-in Dragonswood student portal to save Normal or Hard rewards. Practice itself still works.', 'warn');
      }
    } catch (error) {
      console.error('Math reward profile load failed', error);
      setStatus('Your adventurer record could not be opened. Math practice still works; rewards will wait until the connection returns.', 'error');
    }
  }

  window.addEventListener('dragonswood-math-operations-complete', async event => {
    const detail = event.detail || {};

    if (detail.eligibleForRewards === false || detail.difficulty === 'easy' || detail.practiceMode === 'custom') {
      const worksheet = detail.practiceMode === 'custom';
      if (loot) loot.textContent = worksheet
        ? 'Worksheet practice complete • Quest Points recorded locally • 0 account rewards.'
        : 'Easy practice complete • 0 account rewards by design.';
      setStatus(worksheet
        ? 'Custom / Worksheet Mode is coaching-only for account progression. No Player XP or Gold were requested.'
        : 'Easy difficulty is practice-only. No Player XP, Gold, or other account rewards were requested.', 'preview');
      return;
    }

    await waitForHost();

    if (!service || (environment === 'production' && !liveEnabled)) {
      if (loot) loot.textContent = 'Practice complete • no account changes were made.';
      return;
    }

    if (typeof service.claimMathQuest !== 'function') {
      if (loot) loot.textContent = 'Practice complete • reward service is not configured for this quest.';
      setStatus('The math quest completed, but the connected reward service does not expose claimMathQuest(). No account changes were attempted.', 'warn');
      return;
    }

    try {
      const result = await service.claimMathQuest({
        gameId: 'math_operations_quest',
        gameName: 'Math Operations Quest',
        status: 'complete',
        ...detail
      });
      if (loot) loot.textContent = result?.message || 'Dragonswood reward saved.';
      if (result?.profile) renderProfile(result.profile);
      setStatus(result?.statusText || 'Math quest result saved successfully.', 'good');
    } catch (error) {
      console.error('Math reward claim failed', error);
      if (loot) loot.textContent = 'Practice complete • reward not recorded. Your math work remains complete.';
      setStatus('The math quest is complete, but the reward ledger could not be updated. Your math progress is safe.', 'error');
    }
  });

  initialize();
})();
