import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
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

    // Save order to database
    const order: Order = {
      id: `order-${randomUUID()}`,
      name,
      phone,
      locale,
      items,
      total,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await saveOrder(order);

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
    const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? '';

    if (!token || token === 'PLACEHOLDER_REPLACE_LATER' || !chatIdsRaw) {
      return NextResponse.json({ success: true });
    }

    const chatIds = chatIdsRaw.split(',').map((s) => s.trim()).filter(Boolean);

    for (const id of chatIds) {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: id, text: message }),
      });

      // Telegram send errors are non-critical — order was already saved
      if (!tgRes.ok) { void tgRes.text(); }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
