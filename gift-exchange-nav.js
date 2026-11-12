(function(){
  'use strict';
  const href=new URL('../gift-exchange.html',document.baseURI).href;
  function addLink(){
    const student=document.querySelector('nav[aria-label="Dragonswood features"]');
    if(student&&!student.querySelector('[data-gift-exchange-link]')){
      const link=document.createElement('a');
      link.className='nav-link';link.href=href;link.dataset.giftExchangeLink='';
      link.innerHTML='<span class="nav-icon" aria-hidden="true">🎁</span><span><span class="nav-main">Gift Exchange</span><span class="nav-sub">Wishlist & secret recipient</span></span>';
      student.appendChild(link);
    }
    const group=[...document.querySelectorAll('.teacher-nav-group')].find(x=>x.querySelector('.nav-group-title')?.textContent?.trim()==='Classroom');
    const list=group?.querySelector('.teacher-nav-list');
    if(list&&!list.querySelector('[data-gift-exchange-link]')){
      const link=document.createElement('a');
      link.className='nav-link';link.href=href;link.dataset.giftExchangeLink='';
      link.innerHTML='<span class="nav-icon" aria-hidden="true">🎁</span><span><span class="nav-main">Gift Exchange</span><span class="nav-sub">Private draw & wishlists</span></span>';
      list.appendChild(link);
    }
  }
  const app=document.querySelector('#app');
  if(app){new MutationObserver(addLink).observe(app,{childList:true,subtree:true});addLink()}
})();

