// GET: 전체 목록 조회
// POST: 새 품목 추가

import { db } from "$lib/server/db";
import { items } from "$lib/server/db/schema";
import { json } from "@sveltejs/kit";

export async function GET() {
	const result = await db.select().from(items).orderBy(items.category).all();
	return json(result);
}

export async function POST({ request }) {
	const data = await request.json();

	const { name, category } = data;
	if (!name || !category) {
		return new Response("Invalid data", { status: 400 });
	}

	await db.insert(items).values({
		name,
		category,
		isRented: false,
	});

	return new Response("Item added", { status: 201 });
}
