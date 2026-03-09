import { Resend } from "resend";
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

export const mailSender = async (email: string, title: string, body: string) => {
  await resend.emails.send({
    from: "Habit Tracker <onboarding@resend.dev>",
    to: email,
    subject: title,
    html: body,
  });
};