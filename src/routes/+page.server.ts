import { fail, type Actions } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { bookings } from "$lib/server/db/schema";

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const rawItemId = data.get("itemId");
		const name = data.get("name");
		const date = data.get("date");
		if (!rawItemId || !name || !date) return;
		const itemId = parseInt(rawItemId as string);
		const [rentalStartDateRaw, rentalEndDateRaw] = (date as string).split(
			"to"
		);
		const rentalStartDate = rentalStartDateRaw?.trim();
		let rentalEndDate = rentalEndDateRaw?.trim();
		console.log(rentalEndDate);

		if (!rentalEndDate) {
			rentalEndDate = rentalStartDate;
		}

		await db.insert(bookings).values({
			renterName: name as string,
			rentalStartDate,
			rentalEndDate,
			rentingItem: itemId,
		});

		return { success: true };
	},
};
