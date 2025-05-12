// src/routes/admin/+page.server.ts
import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { env } from "$env/dynamic/private";

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get("password");

		if (password === env.ADMIN_PASSWORD) {
			cookies.set("admin", "true", {
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				secure: false, // 배포 시 true
				maxAge: 60 * 60,
			});
			throw redirect(303, "/admin");
		}

		return fail(401, { incorrect: true });
	},
};
