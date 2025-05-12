import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const rawItemId = data.get("itemId");
		const isRented = data.get("isRented") === "true";
		const name = data.get("name");
		const date = data.get("date");
		if (!rawItemId || !name || !date) return;
		const itemId = parseInt(rawItemId as string);

		if (new Date(date as string).getDate() < new Date().getDate()) {
			return fail(400, {
				incorrect: true,
				itemId,
			});
		}

		console.log(itemId, isRented, name, date);

		if (isRented) {
			await fetch("/api/bookings", {
				method: "POST",
				body: JSON.stringify({
					rentingItem: itemId,
					renterName: name,
					rentalStartDate: new Date().toISOString(),
					rentalEndDate: date,
				}),
			});
		} else {
			await fetch(`/api/items/${itemId}`, {
				method: "PATCH",
				body: JSON.stringify({
					isRented: true,
					renterName: name,
					rentalStartDate: new Date().toISOString(),
					rentalEndDate: date,
				}),
			});
		}

		return { success: true };
	},
};
