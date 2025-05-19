import { db } from "$lib/server/db";
import { bookings } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH({ params, request }) {
	const id = parseInt(params.id);
	const data = await request.json();

	await db
		.update(bookings)
		.set({
			renterName: data.renterName,
			rentalStartDate: data.rentalStartDate,
			rentalEndDate: data.rentalEndDate,
		})
		.where(eq(bookings.id, id));

	console.log("BOOKING UPDATED!");

	return new Response("Booking updated");
}

export async function DELETE({ params }) {
	const id = parseInt(params.id);
	await db.delete(bookings).where(eq(bookings.id, id));
	return new Response("Booking deleted");
}
