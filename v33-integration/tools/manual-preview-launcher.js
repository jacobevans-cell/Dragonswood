(function(){
  'use strict';
  const button=document.querySelector('[data-reset-preview]'),message=document.querySelector('#preview-message');
  button?.addEventListener('click',()=>{
    window.DWArcadeManualStore?.reset();
    message.textContent='Local preview reset: Arcade is open and Jacob Preview has 3 Tokens.';
    button.textContent='✓ Preview reset';
    setTimeout(()=>{button.textContent='Reset local preview'},1800);
  });
})();
