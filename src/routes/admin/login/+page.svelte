<script lang="ts">
	let { form } = $props();
</script>

<h1>Admin Login</h1>

<form method="POST" action="?/login">
	<input
		type="password"
		name="password"
		placeholder="Enter admin password"
		required
	/>
	<button type="submit">Login</button>

	{#if form?.incorrect}
		<p style="color: red;">Incorrect password. Try again.</p>
	{/if}
</form>
