import { db } from "$lib/server/db";
import { bookings } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE({ params }) {
	const id = parseInt(params.id);
	await db.delete(bookings).where(eq(bookings.id, id));
	return new Response("Booking deleted");
}
