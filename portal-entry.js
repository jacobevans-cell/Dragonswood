(function () {
  'use strict';
  // Resolve the canonical site before any school login code starts. Never copy
  // credentials between domains or put account tokens in a navigation URL.
  const site = 'https://dragonswood-9289e.web.app';
  if (location.hostname !== 'jacobevans-cell.github.io') return;
  const prefix = '/Dragonswood/';
  if (!location.pathname.startsWith(prefix)) return;
  const path = location.pathname.slice(prefix.length);
  const routes = {adventure:'home',missions:'home','daily-quest':'morning','curriculum-quest':'home','adventurer-hall':'home'};
  const hash = location.hash.slice(1);
  let target;
  if (!path || path === 'index.html' || path === 'v33-integration/index.html') {
    const requested = hash.replace(/^module\//, '');
    if (['home','morning','math','reading','writing','science','morphology','ccf','teacher'].includes(requested) || routes[requested] || !requested) {
      target = new URL('/#'+(routes[requested] || requested || 'home'), site);
    } else {
      target = new URL('/school-tools.html', site);target.hash = /^(module\/)?[a-z][a-z0-9-]*$/.test(hash) ? hash : 'missions';
    }
  } else {
    target = new URL('/'+path, site);target.hash = /^(module\/)?[a-z][a-z0-9-]*$/.test(hash) ? hash : '';
  }
  // Keep only known, non-credential navigation options for existing activities.
  const query = new URLSearchParams(location.search);
  for (const key of ['levelup','book','bookId','page']) if(query.has(key))target.searchParams.set(key,query.get(key));
  location.replace(target.origin === site ? target.href : site+'/#home');
})();
