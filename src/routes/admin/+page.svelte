<script lang="ts">
	import { isEarlierThan } from "$lib/date-logic";
	import { onMount } from "svelte";

	let form = $state({ name: "", category: "" });
	let items: Item[] = $state([]);

	async function fetchItems() {
		const res = await fetch("/api/items");
		items = await res.json();
	}

	async function addItem(event: SubmitEvent) {
		event.preventDefault();
		if (!form.name || !form.category) return;
		await fetch("/api/items", {
			method: "POST",
			body: JSON.stringify(form),
		});
		await fetchItems();
		alert(
			`${form.category} 카테고리의 ${form.name} 품목이 추가되었습니다.`
		);
		form = { name: "", category: "" };
	}

	async function returnItem(itemId: number) {
		await fetch(`/api/items/${itemId}`, {
			method: "PATCH",
			body: JSON.stringify({
				isRented: false,
				renterName: null,
				rentalStartDate: null,
				rentalEndDate: null,
			}),
		});
		await fetchItems();
	}

	onMount(() => {
		fetchItems();
	});
</script>

<h1>관리자 - 품목 추가</h1>

<form onsubmit={addItem} style="margin-bottom: 2rem;">
	품목 이름: <input bind:value={form.name} required />
	분류: <input bind:value={form.category} required />
	<button type="submit">추가</button>
</form>

<h2>📋 전체 품목 목록</h2>

{#each items as item}
	<div style="border: 1px solid #ccc; padding: 1rem; margin: 1rem 0;">
		<strong>{item.name}</strong> ({item.category})<br />

		{#if item.isRented}
			{#if isEarlierThan(new Date(item.rentalEndDate!), new Date())}
				🔓 대여 기한 초과 - {item.renterName} (반납 예정일: {item.rentalEndDate})
			{:else}
				🔒 대여 중 - {item.renterName} (반납 예정일: {item.rentalEndDate})
			{/if}
			<button onclick={() => returnItem(item.id)}>반납 처리</button>
		{:else}
			✅ <b>대여 가능</b>
		{/if}
	</div>
{/each}
