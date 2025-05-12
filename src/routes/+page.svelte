<script lang="ts">
	import { enhance } from "$app/forms";
	import { isEarlierThan } from "$lib/date-logic";
	import { onMount } from "svelte";

	let { form } = $props();

	let items: Item[] = $state([]);

	async function fetchItems() {
		const res = await fetch("/api/items");
		const data = await res.json();
		items = data;
	}

	onMount(() => {
		fetchItems();
		const interval = setInterval(fetchItems, 5000);
		return () => clearInterval(interval);
	});
</script>

<h1>대여 가능한 품목 목록</h1>

{#each items as item}
	<div style="border: 1px solid #ccc; padding: 1rem; margin: 1rem 0;">
		<strong>{item.name}</strong> ({item.category})<br />
		<form
			method="POST"
			use:enhance={() => {
				if (form?.success) {
					fetchItems();
					console.log("Fetched!");
				}
			}}
		>
			<div>
				{#if item.isRented}
					{#if isEarlierThan(new Date(item.rentalEndDate!), new Date())}
						🔓 대여 기한 초과 - {item.renterName} (반납 예정일: {item.rentalEndDate})
					{:else}
						🔒 대여 중 - {item.renterName} (반납 예정일: {item.rentalEndDate})
					{/if}
				{:else}
					✅ 대여 가능
				{/if}
			</div>
			<input name="itemId" value={item.id} type="hidden" />
			<input name="isRented" value={item.isRented} type="hidden" />
			이름:
			<input name="name" required />
			반납일:
			<input type="date" name="date" required />
			<button type="submit">{item.isRented ? "예약" : "대여"}하기</button>
			{#if form?.incorrect && form?.itemId === item.id}
				<p style="color: red;">
					반납일은 오늘 이전의 날짜로 설정할 수 없습니다.
				</p>
			{/if}
		</form>
	</div>
{/each}
