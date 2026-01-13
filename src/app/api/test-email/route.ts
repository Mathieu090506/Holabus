import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const toEmail = searchParams.get('to') || 'doanthelong061207@gmail.com';

  try {
    const { data, error } = await resend.emails.send({
      from: 'HOLA BUS <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Test Email HolaBus ' + new Date().toLocaleTimeString(),
      html: `<p>Xin chào! Đây là email test gửi tới <strong>${toEmail}</strong>.</p><p>Nếu bạn nhận được mail này thì Resend đã hoạt động ngon lành!</p>`
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email sent', data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}