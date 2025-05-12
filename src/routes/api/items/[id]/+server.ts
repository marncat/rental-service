// PATCH: 대여 상태 업데이트
// DELETE: 품목 삭제

import { db } from "$lib/server/db";
import { items } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH({ params, request }) {
	const id = parseInt(params.id);
	const data = await request.json();

	await db
		.update(items)
		.set({
			isRented: data.isRented,
			renterName: data.renterName || null,
			rentalStartDate: data.rentalStartDate || null,
			rentalEndDate: data.rentalEndDate || null,
		})
		.where(eq(items.id, id));

	return new Response("Item updated");
}

export async function DELETE({ params }) {
	const id = parseInt(params.id);
	await db.delete(items).where(eq(items.id, id));
	return new Response("Item deleted");
}
