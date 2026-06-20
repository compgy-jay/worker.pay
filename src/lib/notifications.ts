import nodemailer from "nodemailer";
import { db } from "./db";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@worker-pay.com";

const TWILIO_SID = process.env.TWILIO_SID || "";
const TWILIO_AUTH = process.env.TWILIO_AUTH || "";
const TWILIO_PHONE = process.env.TWILIO_PHONE || "";

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function logNotification(channel: string, recipient: string, subject: string, message: string, status: string) {
  await db.execute(
    `INSERT INTO notification_log (channel, recipient, subject, message, status) VALUES (?, ?, ?, ?, ?)`,
    [channel, recipient, subject, message, status]
  );
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    await logNotification("email", to, subject, html, "logged");
    return { success: true, mode: "logged" };
  }
  try {
    await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    await logNotification("email", to, subject, html, "sent");
    return { success: true, mode: "sent" };
  } catch (err) {
    await logNotification("email", to, subject, html, "failed");
    return { success: false, error: String(err) };
  }
}

export async function sendSMS(to: string, message: string) {
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_PHONE) {
    await logNotification("sms", to, "", message, "logged");
    return { success: true, mode: "logged" };
  }
  try {
    const accountSid = TWILIO_SID;
    const authToken = TWILIO_AUTH;
    const body = new URLSearchParams({ From: TWILIO_PHONE, To: to, Body: message });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}` }, body }
    );
    const data = await res.json();
    await logNotification("sms", to, "", message, data.error_message ? "failed" : "sent");
    return { success: !data.error_message, sid: data.sid };
  } catch (err) {
    await logNotification("sms", to, "", message, "failed");
    return { success: false, error: String(err) };
  }
}

export async function sendWhatsApp(to: string, message: string) {
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_PHONE) {
    await logNotification("whatsapp", to, "", message, "logged");
    return { success: true, mode: "logged" };
  }
  try {
    const accountSid = TWILIO_SID;
    const authToken = TWILIO_AUTH;
    const body = new URLSearchParams({
      From: `whatsapp:${TWILIO_PHONE}`,
      To: `whatsapp:${to}`,
      Body: message,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}` }, body }
    );
    const data = await res.json();
    await logNotification("whatsapp", to, "", message, data.error_message ? "failed" : "sent");
    return { success: !data.error_message, sid: data.sid };
  } catch (err) {
    await logNotification("whatsapp", to, "", message, "failed");
    return { success: false, error: String(err) };
  }
}
