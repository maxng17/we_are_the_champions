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
    userId: varchar('userId', {length: 256}).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    group: varchar('group', {length: 1}).notNull(),
    regDate: varchar("reg_date", {length: 16}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  }
);

export const matches = createTable(
  'matches', 
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId', {length: 256}).notNull(),
    team1name: varchar('team1_name', { length: 256 }).notNull(),
    team2name: varchar('team2_name', { length: 256}).notNull(),
    team1goals: varchar('team1_goals', { length: 256 }).notNull(),
    team2goals: varchar('team2_goals', { length: 256}).notNull(),
  }
)

export const logs = createTable(
  'logs',
  {
    id: serial('id').primaryKey(),
    userId: varchar('userId', {length: 256}).notNull(),
    operation: varchar('operation', {length: 256}).notNull(),
  }
)
