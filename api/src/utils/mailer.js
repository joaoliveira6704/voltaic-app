import { MailtrapClient } from "mailtrap";

const client = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Voltaic App",
};

const emailTemplate = (token) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Top green bar -->
          <tr>
            <td style="background-color:#00d084;height:6px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 40px 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 178.23 178.23" width="48" height="48">
                <path fill="#00d084" d="M151.72,30.91l-31.64,118.18c-.4,1.49-1.75,2.53-3.29,2.53h-55.33c-1.54,0-2.89-1.04-3.29-2.53L26.52,30.91c-.58-2.16,1.05-4.29,3.29-4.29h43.07c2.18,0,3.8,2.01,3.33,4.14l-11.17,50.72c-.47,2.13,1.15,4.14,3.33,4.14h10.86c1.96,0,3.52,1.65,3.4,3.61l-1.66,28.04c-.21,3.59,4.55,5.02,6.35,1.91l30.34-52.44c1.31-2.27-.33-5.12-2.95-5.12h-15.95c-2.3,0-3.94-2.23-3.25-4.43l8.86-28.18c.45-1.42,1.76-2.39,3.25-2.39h40.81c2.24,0,3.87,2.13,3.29,4.29Z"/>
              </svg>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111111;letter-spacing:1px;text-transform:uppercase;">Password Reset</p>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;color:#888888;">Use the code below to reset your password. It expires in <strong>5 minutes</strong>.</p>
            </td>
          </tr>

          <!-- Token box -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <div style="background-color:#f0fdf8;border:1px solid #00d084;border-radius:8px;padding:20px 40px;display:inline-block;">
                <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:10px;color:#00d084;font-family:monospace;">${token}</p>
              </div>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <p style="margin:0;font-size:11px;color:#aaaaaa;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Bottom green bar -->
          <tr>
            <td style="background-color:#00d084;height:6px;font-size:0;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendResetEmail = async (recipientEmail, token) => {
  console.log("Sending email to:", recipientEmail, "token:", token);
  await client.send({
    from: sender,
    to: [{ email: recipientEmail }],
    subject: "Password Reset Code — Voltaic",
    html: emailTemplate(token),
    text: `Your password reset code is ${token}. It expires in 5 minutes.`,
  });
};

export default sendResetEmail;
