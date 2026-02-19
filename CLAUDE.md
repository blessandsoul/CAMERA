# Project Rules

All detailed rules are in `.claude/rules/`. Read the relevant `core.md` index first — don't read every file upfront.

- **Global rules**: `.claude/rules/global/core.md` — always active
- **Client rules**: `.claude/rules/client/core.md` — when working in `client/`
- **Server rules**: `.claude/rules/server/core.md` — when working in `server/`

---

## Design Agent Auto-Activation

When the user's request mentions or relates to ANY of the following — invoke the Skill tool with `skill="ui"` BEFORE writing any code, making suggestions, or responding with design content:

**Trigger keywords / topics:**
- UI, UX, design, visual, дизайн, визуал, интерфейс
- component, component, компонент
- styling, стиль, стилизация, стили
- color, colour, цвет, цвета, палитра
- layout, макет, разметка
- typography, шрифт, шрифты
- landing page, landing, лендинг
- dashboard, дашборд
- page design, страница, дизайн страницы
- "looks bad", "выглядит плохо", "гавно", "переделай дизайн"
- "make it better", "улучши", "красиво", "красивее"
- navbar, sidebar, card, modal, button, form (when asking about appearance)
- dark mode, темная тема
- animation, анимация, hover, transitions

**How to invoke:**
```
Use the Skill tool: skill="ui", args="<user's original request>"
```

This is a **BLOCKING REQUIREMENT** — do not generate any design output without first invoking `/ui`.

---

## Stack Quick Reference

**Client**: Next.js App Router + TypeScript + Tailwind + shadcn/ui + React Query + Redux
**Server**: Fastify + TypeScript + Prisma + MySQL + Redis
**Design**: Neuro-Minimalism (see `.claude/rules/client/04-design-system.md`)
