<script lang="ts">
	import { enhance } from "$app/forms";
	import { isEarlierThan } from "$lib/date-logic";
	import { onMount } from "svelte";

	let items: Item[] = $state([]);
	let bookings: Map<number, RentInfo[]> = $state(new Map());
	let waitingItems: number[] = $state([]);
	let showWarning: number[] = $state([]);

	async function fetchItems() {
		const res = await fetch("/api/items");
		const data = await res.json();
		items = data;
	}

	async function fetchBookings() {
		const res = await fetch("/api/bookings");
		const data = await res.json();
		bookings = data.reduce(
			(map: Map<number, RentInfo[]>, booking: BookInfo) =>
				map.set(booking.rentingItem, [
					...(map.get(booking.rentingItem) || []),
					booking as RentInfo,
				]),
			new Map()
		);
	}

	async function sync() {
		fetchBookings();
		fetchItems();
	}

	onMount(() => {
		sync();
		const interval = setInterval(sync, 5000);
		return () => clearInterval(interval);
	});
</script>

<h1>대여 가능한 품목 목록</h1>

{#each items as item}
	<div style="border: 1px solid #ccc; padding: 1rem; margin: 1rem 0;">
		<strong>{item.name}</strong> ({item.category})<br />
		<form
			method="POST"
			use:enhance={({
				formElement,
				formData,
				action,
				cancel,
				submitter,
			}) => {
				waitingItems.push(item.id);
				const date = formData.get("date");

				if (isEarlierThan(new Date(date as string), new Date())) {
					showWarning.push(item.id);
					waitingItems = waitingItems.filter(
						(value) => value !== item.id
					);
					return cancel();
				}
				showWarning = showWarning.filter((value) => value !== item.id);

				// `formElement` is this `<form>` element
				// `formData` is its `FormData` object that's about to be submitted
				// `action` is the URL to which the form is posted
				// calling `cancel()` will prevent the submission
				// `submitter` is the `HTMLElement` that caused the form to be submitted

				return async ({ result, update }) => {
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
					sync();
					waitingItems = waitingItems.filter(
						(value) => value !== item.id
					);
				};
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
			{#if waitingItems.includes(item.id)}
				처리 중...
			{:else}
				<input name="itemId" value={item.id} type="hidden" />
				<input name="isRented" value={item.isRented} type="hidden" />
				이름:
				<input name="name" required />
				반납일:
				<input type="date" name="date" required />
				<button type="submit"
					>{item.isRented ? "예약" : "대여"}하기</button
				>
				{#if item.isRented}
					{#if (bookings.get(item.id) ?? []).length > 0}
						<details>
							<summary
								>예약: {(bookings.get(item.id) ?? [])
									.length}</summary
							>
							<ul>
								{#each bookings.get(item.id) ?? [] as booking}
									<li>
										<strong>{booking.renterName}</strong> -
										반납일: {booking.rentalEndDate}
									</li>
								{/each}
							</ul>
						</details>
					{/if}
				{/if}
				{#if showWarning.includes(item.id)}
					<p style="color: red;">
						반납일은 오늘 이전의 날짜로 설정할 수 없습니다.
					</p>
				{/if}
			{/if}
		</form>
	</div>
{/each}
