import nodemailer from 'nodemailer';
import supabase from './db-client.js';

const STATUS_TEXT = {
  pending: { subject: 'Order received', line: 'We have received your order and will start processing it soon.' },
  processing: { subject: 'Order confirmed', line: 'Your order is confirmed and is being prepared.' },
  shipped: { subject: 'Order shipped', line: 'Good news! Your order is on its way.' },
  delivered: { subject: 'Order delivered', line: 'Your order has been delivered. Thank you for shopping with us!' },
  cancelled: { subject: 'Order cancelled', line: 'Your order has been cancelled. Contact us if this was a mistake.' },
  failed: { subject: 'Payment failed', line: 'Your payment could not be completed. Please try placing the order again.' },
};

async function getSettings() {
  const { data } = await supabase.from('settings').select('*');
  const settings = {};
  (data || []).forEach(r => { settings[r.key] = r.value; });
  return settings;
}

// Sends an order status email. Never throws: email problems must not break orders.
export async function sendOrderEmail(order, status) {
  try {
    const text = STATUS_TEXT[status];
    if (!order?.customer_email || !text) return;

    const s = await getSettings();
    if (s.order_confirmation === 'false') return;
    if (!s.smtp_host || !s.smtp_user || !s.smtp_pass) {
      console.warn('[Mailer] SMTP not configured in Admin → Email Config, skipping email');
      return;
    }

    const port = Number(s.smtp_port) || 587;
    const transporter = nodemailer.createTransport({
      host: s.smtp_host,
      port,
      secure: port === 465,
      auth: { user: s.smtp_user, pass: s.smtp_pass },
    });

    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    const rows = (items || []).map(i =>
      `<tr><td style="padding:6px 0">${i.product_name}${i.size ? ` (${i.size})` : ''} × ${i.quantity}</td><td style="text-align:right">${s.currency || 'LKR'} ${Number(i.price * i.quantity).toFixed(2)}</td></tr>`
    ).join('');

    const storeName = s.from_name || 'Uncommon Clothing';
    await transporter.sendMail({
      from: `"${storeName}" <${s.from_email || s.smtp_user}>`,
      to: order.customer_email,
      subject: `${text.subject} – Order #${order.id}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111">
          <h2>${storeName}</h2>
          <p>Hi ${order.customer_name || 'there'},</p>
          <p>${text.line}</p>
          <p><b>Order #${order.id}</b> — Status: <b>${status}</b></p>
          <table style="width:100%;border-top:1px solid #ddd;margin-top:12px">${rows}</table>
          <p style="text-align:right;font-weight:bold">Total: ${s.currency || 'LKR'} ${Number(order.total).toFixed(2)}</p>
          <p style="color:#777;font-size:12px">Delivery to: ${order.address || ''}, ${order.city || ''}</p>
        </div>`,
    });
    console.log(`[Mailer] Sent "${status}" email for order #${order.id} to ${order.customer_email}`);
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err.message);
  }
}
