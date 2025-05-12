<script lang="ts">
	import { isEarlierThan } from "$lib/date-logic";
	import { onMount } from "svelte";

	let items: Item[] = $state([]);
	let formDataMap: Record<number, { name: string; date: string }> = $state(
		{}
	);

	async function fetchItems() {
		const res = await fetch("/api/items");
		const data = await res.json();
		items = data;

		// formDataMap에 없는 항목 초기화
		for (const item of items) {
			if (!formDataMap[item.id]) {
				formDataMap[item.id] = { name: "", date: "" };
			}
		}
	}

	async function rentItem(itemId: number) {
		const { name, date } = formDataMap[itemId];
		if (!name || !date) return;

		if (new Date(date).getDate() < new Date().getDate()) {
			formDataMap[itemId] = { name: "", date: "" };
			alert("반납일은 오늘 이전의 날짜로 설정할 수 없습니다.");
			return;
		}

		await fetch(`/api/items/${itemId}`, {
			method: "PATCH",
			body: JSON.stringify({
				isRented: true,
				renterName: name,
				rentalStartDate: new Date().toISOString(),
				rentalEndDate: date,
			}),
		});

		await fetchItems();
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

		{#if item.isRented}
			{#if isEarlierThan(new Date(item.rentalEndDate!), new Date())}
				🔓 대여 기한 초과 - {item.renterName} (반납 예정일: {item.rentalEndDate})
			{:else}
				🔒 대여 중 - {item.renterName} (반납 예정일: {item.rentalEndDate})
			{/if}
		{:else}
			<form
				onsubmit={(event: SubmitEvent) => {
					event.preventDefault();
					rentItem(item.id);
				}}
			>
				이름: <input bind:value={formDataMap[item.id].name} required />
				반납일:
				<input
					type="date"
					bind:value={formDataMap[item.id].date}
					required
				/>
				<button type="submit">대여하기</button>
			</form>
		{/if}
	</div>
{/each}
