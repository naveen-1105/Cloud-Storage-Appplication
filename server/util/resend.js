import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.resend_url);

export async function otpSender(otp) {
  const { data, error } = await resend.emails.send({
    from: 'StorageApp <OTP@resend.dev>',
    to: ['naveenkushwaha629@gmail.com'],
    subject: 'Hello World',
    html: `<strong>It works ${otp}!</strong>`,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}