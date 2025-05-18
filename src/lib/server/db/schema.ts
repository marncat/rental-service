// src/lib/db/schema.ts

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	category: text("category").notNull(),
});

export const bookings = sqliteTable("bookings", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	rentingItem: integer("renting_item").references(() => items.id),
	renterName: text("renter_name").notNull(),
	rentalStartDate: text("rental_start_date").notNull(), // ISO string: YYYY-MM-DD or datetime
	rentalEndDate: text("rental_end_date").notNull(), // optional: return or due date
});
