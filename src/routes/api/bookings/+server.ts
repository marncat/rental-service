// GET: 전체 목록 조회
// POST: 새 예약 추가

import { db } from "$lib/server/db";
import { bookings } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";

export async function GET() {
	const result = await db.select().from(bookings).all();
	return json(result);
}
