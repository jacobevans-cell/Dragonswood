// Called only by a student/teacher clicking Reconnect, using the parent's Firebase account.
export function createParentReauthentication({getAuth,reauthenticateWithPopup,createProvider}){
 let pending=null,pendingUid=null;
 return function reconnect(expectedUid){
  const auth=getAuth(),user=auth?.currentUser;
  if(!user||expectedUid&&user.uid!==expectedUid)return Promise.reject(Object.assign(Error('Your selected account changed. Reopen Dragonswood; your work is kept.'),{status:409}));
  if(pending)return pendingUid===user.uid?pending:Promise.reject(Object.assign(Error('Wait for the current account to reconnect.'),{status:409}));
  pendingUid=user.uid;
  // Start the provider popup synchronously in the click's user activation.
  let operation;try{operation=reauthenticateWithPopup(user,createProvider(user));}catch(error){pendingUid=null;return Promise.reject(error);}
  const sameAccount=()=>{if(auth.currentUser?.uid!==user.uid)throw Object.assign(Error('The account changed during reconnection. Your work has not been moved.'),{status:409});};
  pending=Promise.resolve(operation).then(async result=>{sameAccount();if(result.user?.uid!==user.uid)throw Object.assign(Error('Reconnect with the same school account.'),{status:409});await user.getIdToken(true);sameAccount();return {authUid:user.uid};}).finally(()=>{pending=null;pendingUid=null;});
  return pending;
 };
}
