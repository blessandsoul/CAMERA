import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required'),
  ADMIN_SESSION_SECRET: z.string().min(20, 'ADMIN_SESSION_SECRET must be at least 20 characters'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_IDS: z.string().optional(),
  // Backward compat
  TELEGRAM_CHAT_ID: z.string().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('TechBrain'),
  NEXT_PUBLIC_PHONE: z.string().optional(),
});

function validateEnv(): z.infer<typeof serverEnvSchema> & z.infer<typeof publicEnvSchema> {
  const serverResult = serverEnvSchema.safeParse(process.env);
  const publicResult = publicEnvSchema.safeParse(process.env);

  if (!serverResult.success) {
    const errors = serverResult.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`Missing or invalid environment variables:\n${message}`);
  }

  if (!publicResult.success) {
    const errors = publicResult.error.flatten().fieldErrors;
    const message = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    throw new Error(`Missing or invalid public environment variables:\n${message}`);
  }

  return { ...serverResult.data, ...publicResult.data };
}

export const env = validateEnv();
