const PROJECT_REF = process.env.FULLSTACK_PROJECT_REF || '';
const RESTORE_URL = process.env.FULLSTACK_RESTORE_API_URL || '';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

let _restoreTriggered = false;

export function triggerRestore() {
  if (_restoreTriggered || !PROJECT_REF || !RESTORE_URL || !ACCESS_TOKEN) return;
  _restoreTriggered = true;
  
  fetch(`${RESTORE_URL}/${PROJECT_REF}/restore`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    }
  }).catch(() => { });
  
  setTimeout(() => { _restoreTriggered = false; }, 60000);
}
