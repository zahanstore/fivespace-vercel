// ============================================
// CONTACT FORM EMAIL HANDLER — Vercel Function
// Sends a branded email via Resend when the
// contact form is submitted. RESEND_API_KEY
// stays server-side, never in the browser.
// Works for both safa and fivespace brands.
// ============================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    first_name, last_name, email,
    project_type, location, message, brand
  } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const isFive    = brand === 'fivespace';
  const toEmail   = isFive ? 'studio@fivespace.zahan.one' : 'studio@safa.zahan.one';
  const brandName = isFive ? 'Five Space World' : 'Safa Zahan';
  const accent    = isFive ? '#4A6741' : '#B87333';
  const bg        = isFive ? '#F2F5F0' : '#F5EFE6';
  const header    = isFive ? '#3A4A38' : '#5A4A42';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:     `${brandName} <noreply@safa.zahan.one>`,
        to:       [toEmail],
        reply_to: email,
        subject:  `New enquiry — ${first_name} ${last_name}${project_type ? ' · ' + project_type : ''}`,
        html: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#3A2E28;background:#fff;">
  <div style="background:${header};padding:2rem 2.5rem;">
    <h1 style="color:${accent};font-size:1.4rem;margin:0;font-weight:400;letter-spacing:0.12em;">${brandName}</h1>
    <p style="color:#C9B6A0;margin:0.4rem 0 0;font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;">New Project Enquiry</p>
  </div>
  <div style="padding:2rem 2.5rem;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">
      <tr><td style="padding:0.4rem 0;color:${accent};font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;width:130px;">Name</td>
          <td style="padding:0.4rem 0;">${first_name} ${last_name}</td></tr>
      <tr><td style="padding:0.4rem 0;color:${accent};font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;">Email</td>
          <td style="padding:0.4rem 0;"><a href="mailto:${email}" style="color:${accent};">${email}</a></td></tr>
      ${project_type ? `<tr><td style="padding:0.4rem 0;color:${accent};font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;">Project</td>
          <td style="padding:0.4rem 0;">${project_type}</td></tr>` : ''}
      ${location ? `<tr><td style="padding:0.4rem 0;color:${accent};font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;">Location</td>
          <td style="padding:0.4rem 0;">${location}</td></tr>` : ''}
    </table>
    <div style="background:${bg};padding:1.5rem;border-left:3px solid ${accent};">
      <p style="color:${accent};font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 0.75rem;">Message</p>
      <p style="line-height:1.8;margin:0;">${message.replace(/\n/g, '<br>')}</p>
    </div>
    <p style="margin-top:1.5rem;font-size:0.75rem;color:#aaa;text-align:center;">
      Hit reply to respond directly to ${first_name}.
    </p>
  </div>
</div>`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Resend API error');
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Resend error:', err);
    // Still return success to user — message is saved in Supabase
    return res.status(200).json({ success: true, warning: 'Email notification failed but message was saved.' });
  }
}
