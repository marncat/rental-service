// src/lib/db/schema.ts

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	category: text("category").notNull(),
	isRented: integer("is_rented", { mode: "boolean" })
		.notNull()
		.default(false),
	renterName: text("renter_name"),
	rentalStartDate: text("rental_start_date"), // ISO string: YYYY-MM-DD or datetime
	rentalEndDate: text("rental_end_date"), // optional: return or due date
});

export const bookings = sqliteTable("bookings", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	rentingItem: integer("renting_item").references(() => items.id),
	renterName: text("renter_name"),
	rentalStartDate: text("rental_start_date"), // ISO string: YYYY-MM-DD or datetime
	rentalEndDate: text("rental_end_date"), // optional: return or due date
});
