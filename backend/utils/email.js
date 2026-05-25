import { Resend } from "resend";

let resendClient = null;
let resendClientApiKey = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient || resendClientApiKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientApiKey = apiKey;
  }

  return resendClient;
};

const buildPasswordResetEmail = ({ resetUrl }) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
      <p>We received a request to reset your AI Recipe Generator password.</p>
      <p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;"
        >
          Reset password
        </a>
      </p>
      <p>This link expires in 30 minutes. If you did not request this, you can safely ignore this email.</p>
      <p style="font-size: 13px; color: #6b7280; word-break: break-all;">
        If the button does not work, paste this link into your browser:<br />
        ${resetUrl}
      </p>
    </div>
  `;
};

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const resend = getResendClient();

  if (!resend) {
    console.warn(
      "RESEND_API_KEY is not configured. Password reset email was not sent.",
    );
    return { sent: false, skippedReason: "missing_resend_api_key" };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    "AI Recipe Generator <onboarding@resend.dev>";
  const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: "Reset your AI Recipe Generator password",
    html: buildPasswordResetEmail({ resetUrl }),
    ...(replyToEmail ? { replyTo: replyToEmail } : {}),
  });

  if (error) {
    throw new Error(error.message || "Unable to send password reset email");
  }

  return { sent: true, data };
};
