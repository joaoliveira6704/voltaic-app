import { MailtrapClient } from "mailtrap";

const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

const sender = {
  email: "reset@voltaic.com",
  name: "Voltaic App",
};

export const sendResetEmail = async (recipientEmail, token) => {
  await client.send({
    from: sender,
    to: [{ email: recipientEmail }],
    subject: "Password reset code",
    text: `Your password reset token is ${token}. It expires in 5 minutes.`,
  });
};
