// src/routes/admin/+page.server.ts
import { redirect } from "@sveltejs/kit";

export const load = ({ cookies }) => {
	if (cookies.get("admin") !== "true") {
		throw redirect(303, "/admin/login");
	}
};
