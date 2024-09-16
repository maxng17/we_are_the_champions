// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `we_are_the_champions_${name}`);

export const teams = createTable(
  "teams",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    group: varchar('group', {length: 1}).notNull(),
    totalScore: varchar('total_score', {length: 4}),
    alternateScore: varchar('alternate_score', {length: 4}),
    regDate: date("reg_date"),
    wins: varchar('wins', {length: 4}),
    losts: varchar('losts', {length: 4}),
    draws: varchar('draws', {length: 4}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);

export const matches = createTable(
  'matches', 
  {
    id: serial('id').primaryKey(),
    teamAname: varchar('teamA_name', { length: 256 }).notNull(),
    teamBname: varchar('teamB_name', { length: 256}).notNull(),
    teamAgoals: varchar('teamA_goals', { length: 256 }).notNull(),
    teamBgoals: varchar('teamB_goals', { length: 256}).notNull(),
  }
)

export const logs = createTable(
  'logs',
  {
    id: serial('id').primaryKey(),
    operation: varchar('operation', {length: 256}).notNull(),
  }
)
