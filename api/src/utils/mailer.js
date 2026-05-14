import { MailtrapClient } from "mailtrap";

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Voltaic App",
};

const sendResetEmail = async (recipientEmail, token) => {
  console.log("Sending email to:", recipientEmail, "token:", token);
  await client.send({
    from: sender,
    to: [{ email: recipientEmail }],
    subject: "Password reset code",
    text: `Your password reset token is ${token}. It expires in 5 minutes.`,
  });
};

export default sendResetEmail;
