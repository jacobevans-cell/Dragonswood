(function(){'use strict';
 // Existing bookmarks stay on this website. No cross-site portal or token handoff.
 const path=location.pathname;if(!/\/(?:index\.html)?$/.test(path)||path.includes('/v33-integration/'))return;
 const old=location.hash.slice(1).replace(/^module\//,'');
 const routes={adventure:'home',missions:'home','daily-quest':'morning','curriculum-quest':'home','adventurer-hall':'home'};
 if(routes[old]){history.replaceState(null,'','#'+routes[old]);return;}
 if(['rune-spelling','class-reader','games','passes','schedule','dragon-tongues','scribe','hall','leaderboard','council','kingdom','arcade'].includes(old))location.replace('./school-tools.html#'+location.hash.slice(1));
})();
