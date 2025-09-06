import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || "127.0.0.1",
  port: Number(process.env.MAILHOG_PORT || 1025),
  secure: false,
});

export async function sendEmail(opts: {
  to?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}) {
  const from = process.env.MAIL_FROM || "no-reply@localhost";
  const info = await transporter.sendMail({ from, ...opts });
  return { messageId: info.messageId };
}
