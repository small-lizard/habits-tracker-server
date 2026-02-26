import nodemailer from "nodemailer";

export const mailSender = async (email: string, title: string, body: string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `"Habit Tracker" <${process.env.SMTP_USER}>`,
        to: email,
        subject: title,
        html: body,
    });

    return info;
};