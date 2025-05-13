import { fail, type Actions } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { bookings, items } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const rawItemId = data.get("itemId");
		const isRented = data.get("isRented") === "true";
		const name = data.get("name");
		const date = data.get("date");
		if (!rawItemId || !name || !date) return;
		const itemId = parseInt(rawItemId as string);

		if (isRented) {
			await db.insert(bookings).values({
				renterName: name as string,
				rentalStartDate: new Date().toISOString(),
				rentalEndDate: date as string,
				rentingItem: itemId,
			});
		} else {
			const item = await db
				.select({
					isRented: items.isRented,
				})
				.from(items)
				.where(eq(items.id, itemId));
			if (item[0].isRented) {
				return fail(400, {
					late: true,
				});
			}
			await db
				.update(items)
				.set({
					isRented: true,
					renterName: name as string,
					rentalStartDate: new Date().toISOString(),
					rentalEndDate: date as string,
				})
				.where(eq(items.id, itemId));
		}

		return { success: true };
	},
};
