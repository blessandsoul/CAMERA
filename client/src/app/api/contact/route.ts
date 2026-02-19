import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveInquiry } from '@/lib/content';
import type { Inquiry } from '@/lib/content';

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
  message: z.string().min(10).max(1000),
  locale: z.enum(['ka', 'ru', 'en']),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as unknown;
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, phone, message, locale } = parsed.data;

    const inquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      name,
      phone,
      message,
      locale,
      createdAt: new Date().toISOString(),
    };
    saveInquiry(inquiry);

    const now = new Date().toLocaleString('ru-RU', {
      timeZone: 'Asia/Tbilisi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tgMessage = `📩 New Inquiry — TechBrain.ge\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n💬 Message: ${message}\n🌐 Language: ${locale}\n\n🕐 ${now}`;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || token === 'PLACEHOLDER_REPLACE_LATER' || !chatId || chatId === 'PLACEHOLDER_REPLACE_LATER') {
      return NextResponse.json({ success: true });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: tgMessage }),
    });

    if (!tgRes.ok) {
      return NextResponse.json({ success: false, error: 'Telegram error' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
