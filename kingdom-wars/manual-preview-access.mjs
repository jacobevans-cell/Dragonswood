export const environment='manual-preview';

const session=Object.freeze({
  allowed:true,
  reason:'manual-preview',
  environment,
  dailyAccessUnlocked:true,
  user:Object.freeze({
    uid:'manual-preview-kingdom-tester',
    email:'preview-student@example.invalid',
    displayName:'Jacob Preview'
  }),
  student:Object.freeze({
    role:'tester',
    firstName:'Jacob',
    displayName:'Jacob Preview',
    classId:'ranger',
    xp:1520,
    rpgInventory:Object.freeze(['briarfox_bow']),
    rpgEquipped:Object.freeze({weapon:'briarfox_bow'}),
    ownedPets:Object.freeze(['embercub']),
    activePet:'embercub'
  })
});

export async function getKingdomTesterSession(){
  return session;
}

export async function requireKingdomTester(){
  return session;
}
