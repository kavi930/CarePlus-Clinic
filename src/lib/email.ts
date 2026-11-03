export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // Placeholder email sender for demo purposes.
  // In a real implementation you would integrate with an email service like SendGrid, Nodemailer, or AWS SES.
  console.log(`📧 Sending email -> To: ${to}, Subject: ${subject}`);
  console.log(`Content: ${text}`);
  // Simulate async operation
  return Promise.resolve({ messageId: 'demo-message-id' });
}
