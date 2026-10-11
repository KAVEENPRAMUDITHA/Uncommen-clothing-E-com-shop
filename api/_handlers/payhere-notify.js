import crypto from 'crypto';
import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = typeof req.body === 'object' ? req.body : {};
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      status_message,
      method,
    } = data;

    console.log('[PayHere Notify] Received IPN for Order #', order_id, {
      payment_id,
      status_code,
      payhere_amount,
      payhere_currency,
      status_message,
      method,
    });

    if (!order_id || !merchant_id || !md5sig) {
      return res.status(400).json({ error: 'Invalid PayHere notification data' });
    }

    // Retrieve settings to get merchant secret
    const { data: settingsRows } = await supabase.from('settings').select('*');
    const settings = {};
    (settingsRows || []).forEach(r => { settings[r.key] = r.value; });

    const merchantSecret = settings.payhere_secret || 'Mzg5MzE2ODk1MTM5OTEzNzMzNjMzNDczMTgwMDQ4MTYzNTM3NTkzNA==';
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const expectedSig = crypto
      .createHash('md5')
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest('hex')
      .toUpperCase();

    // Verify signature
    if (expectedSig !== md5sig.toUpperCase()) {
      console.error('[PayHere Notify] Signature verification failed! Expected:', expectedSig, 'Got:', md5sig);
      return res.status(400).send('Signature verification failed');
    }

    const orderIdNum = Number(order_id);

    // Status code:
    // 2 = Success
    // 0 = Pending
    // -1 = Canceled
    // -2 = Failed
    // -3 = Chargedback
    let newStatus = 'pending';
    if (Number(status_code) === 2) {
      newStatus = 'processing'; // Paid, ready to be processed
    } else if (Number(status_code) === -1) {
      newStatus = 'cancelled';
    } else if (Number(status_code) === -2) {
      newStatus = 'failed';
    }

    console.log(`[PayHere Notify] Updating order #${order_id} status to: ${newStatus}`);

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: newStatus,
      })
      .eq('id', orderIdNum);

    if (updateErr) {
      console.error('[PayHere Notify] Failed to update order:', updateErr);
      return res.status(500).send('Database update error');
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[PayHere Notify] Error handling webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
