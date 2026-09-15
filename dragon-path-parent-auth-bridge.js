// The outer Dragonswood portal remains the only Firebase sign-in owner.
import {getApp,getApps} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import {getAuth,reauthenticateWithPopup,GoogleAuthProvider} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import {createParentAuthRequest,waitForAuthOperation} from './learning-portal/public/parent-auth-request.js?v=dragon-path-13';
import {createParentReauthentication} from './learning-portal/public/parent-reauthentication.js?v=dragon-path-15';
const reconnect=createParentReauthentication({getAuth:()=>getAuth(getApp()),reauthenticateWithPopup,createProvider:user=>{const provider=new GoogleAuthProvider();if(user.email)provider.setCustomParameters({login_hint:user.email});return provider;}});
async function outerAuth(signal){
  for(let i=0;i<100;i++){
    signal.throwIfAborted();
    if(getApps().length){const auth=getAuth(getApp());if(auth.currentUser)return auth;}
    await waitForAuthOperation(()=>new Promise(resolve=>setTimeout(resolve,100)),signal);
  }
  throw Object.assign(new Error('The main Dragonswood portal is not signed in yet.'),{status:401});
}
window.DWDragonPathParentAuth=Object.freeze({version:'single-auth-v2',reauthenticate:reconnect,request:createParentAuthRequest({getAuth:outerAuth,apiOrigin:'https://dragonswood-9289e.web.app'})});
