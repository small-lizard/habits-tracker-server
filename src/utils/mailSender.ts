import { Resend } from "resend";
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

export const mailSender = async (email: string, title: string, body: string) => {
  await resend.emails.send({
    from: `Habit Tracker <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: title,
    html: body,
  });
};