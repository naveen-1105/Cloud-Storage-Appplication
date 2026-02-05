import { Resend } from 'resend';

const resend = new Resend('re_ZEEv1UE7_LvfwkrPzjKMSvNnFCpY7u1Lr');

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