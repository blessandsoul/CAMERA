import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveOrder } from '@/lib/content';
import type { Order } from '@/lib/content';

const OrderSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(1).max(30),
  locale: z.enum(['ka', 'ru', 'en']),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ).min(1),
  total: z.number().nonnegative(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as unknown;
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { name, phone, locale, items, total } = parsed.data;

    // Save order to JSON file
    const order: Order = {
      id: `order-${Date.now()}`,
      name,
      phone,
      locale,
      items,
      total,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    saveOrder(order);

    const itemLines = items
      .map((i) => `• ${i.name} × ${i.quantity} — ${i.price * i.quantity} ₾`)
      .join('\n');

    const now = new Date().toLocaleString('ru-RU', {
      timeZone: 'Asia/Tbilisi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `🛒 New Order — TechBrain.ge\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🌐 Language: ${locale}\n\n📦 Order items:\n${itemLines}\n\n💰 Total: ${total} ₾\n\n🕐 ${now}`;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || token === 'PLACEHOLDER_REPLACE_LATER' || !chatId || chatId === 'PLACEHOLDER_REPLACE_LATER') {
      return NextResponse.json({ success: true });
    }

    const chatIds = [chatId, '5528795929'];

    for (const id of chatIds) {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text: message }),
      });

      if (!tgRes.ok) {
        const tgError = await tgRes.json() as unknown;
        console.error(`[orders] Telegram error (chat ${id}):`, JSON.stringify(tgError));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
