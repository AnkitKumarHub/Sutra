import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role_enum", ["USER", "CREATOR", "ADMIN"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  profileImageUrl: text("profile_image_url"),
  role: userRoleEnum("role").notNull().default("USER"),
  isBlocked: boolean("is_blocked").notNull().default(false),

  salt: text("salt"), // not every user will have a password (e.g. oauth users), so we can keep salt and hash as nullable
  password: text("password"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
