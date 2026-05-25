const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInviteEmail(toEmail) {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'You are invited!',
      html: `
        <h2>Welcome to Engine Portal 🚀</h2>
        <p>You have been invited to join the portal.</p>
      `,
    });

    console.log('Email sent:', data);

  } catch (err) {
    console.error('Email error:', err);
  }
}

module.exports = sendInviteEmail;