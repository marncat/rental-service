import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	throw redirect(302, "/");
};

export const actions: Actions = {
	default({ cookies }) {
		cookies.set("admin", "", {
			path: "/",
			expires: new Date(0),
		});
		// redirect
		throw redirect(302, "/admin");
	},
};
