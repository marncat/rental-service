// PATCH: 대여 상태 업데이트
// DELETE: 품목 삭제

import { db } from "$lib/server/db";
import { items } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE({ params }) {
	const id = parseInt(params.id);
	await db.delete(items).where(eq(items.id, id));
	return new Response("Item deleted");
}
