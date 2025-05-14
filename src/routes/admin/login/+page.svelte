<script lang="ts">
	let { form } = $props();
</script>

<h1 style="text-align: center;">🔑 관리자 로그인</h1>

<form
	method="POST"
	action="?/login"
	style="max-width: 400px; margin: 0 auto; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;"
>
	<input
		type="password"
		name="password"
		placeholder="관리자 비밀번호를 입력하세요..."
		required
		style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 4px;"
	/>
	<button
		type="submit"
		style="width: 100%; padding: 0.5rem; background-color: #f0f0f0; border: none; border-radius: 4px; cursor: pointer;"
		>로그인</button
	>

	{#if form?.incorrect}
		<p style="color: red; text-align: center; margin-top: 1rem;">
			잘못된 비밀번호입니다.
		</p>
	{/if}
</form>

<svelte:head>
	<title>Hexapoda Renting Manage</title>
</svelte:head>

<style>
	input,
	button {
		box-sizing: border-box;
	}

	p {
		font-size: 0.85rem;
		color: red;
		text-align: center;
		margin-top: 0.5rem;
	}
</style>
