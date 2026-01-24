import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  telegram: text('telegram').notNull(),
  xProfile: text('x_profile').notNull(),
  expertise: text('expertise').notNull(),
  experienceLevel: text('experience_level').notNull(),
  monthlyRate: text('monthly_rate'),
  biggestWin: text('biggest_win').notNull(),
  portfolio: text('portfolio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
