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

<h1>🔍 물품 대여 조회</h1>

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
				let latestDate = new Date();
				if (item.isRented) {
					latestDate = new Date(item.rentalEndDate!);
					latestDate.setDate(latestDate.getDate() + 1);
				}

				if (bookings.get(item.id)) {
					let bookingArr = bookings.get(item.id)!;
					latestDate = new Date(
						bookingArr[bookingArr.length - 1].rentalEndDate!
					);
					latestDate.setDate(latestDate.getDate() + 1);
				}

				if (isEarlierThan(new Date(date as string), latestDate)) {
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
					if (result.type === "failure") {
						alert("이미 대여된 물품입니다.");
					}
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
					sync();
					waitingItems = waitingItems.filter(
						(value) => value !== item.id
					);
				};
			}}
		>
			{#if item.isRented}
				<p style="margin-top: 8px; margin-bottom: 4px">
					{#if isEarlierThan(new Date(item.rentalEndDate!), new Date())}
						🔓 대여 기한 초과 - {item.renterName} (대여 종료일: {item.rentalEndDate})
					{:else}
						🔒 대여 중 - {item.renterName} (대여 종료일: {item.rentalEndDate})
					{/if}
				</p>
			{:else}
				<p style="margin-top: 8px; margin-bottom: 16px">✅ 대여 가능</p>
			{/if}
			{#if waitingItems.includes(item.id)}
				처리 중...
			{:else}
				{#if item.isRented}
					{#if (bookings.get(item.id) ?? []).length > 0}
						<details style="margin-bottom:16px; margin-left:16px">
							<summary>
								📅 예약: {(bookings.get(item.id) ?? []).length}
							</summary>
							<ul style="margin-top: 0">
								{#each bookings.get(item.id) ?? [] as booking}
									<li>
										<strong>{booking.renterName}</strong> -
										대여 종료일: {booking.rentalEndDate}
									</li>
								{/each}
							</ul>
						</details>
					{/if}
				{/if}
				<input name="itemId" value={item.id} type="hidden" />
				<input name="isRented" value={item.isRented} type="hidden" />
				<div>
					이름:
					<input name="name" required />
				</div>
				<div>
					대여 종료일:
					<input type="date" name="date" required />
				</div>
				<button type="submit"
					>{item.isRented ? "예약" : "대여"}하기</button
				>

				{#if showWarning.includes(item.id)}
					<p style="color: red;">
						{#if item.isRented}
							예약 시 대여 종료일은 마지막 대여/예약의 대여 종료일
							이후로 선택해야 합니다.
						{:else}
							대여 종료일은 오늘 이전의 날짜로 설정할 수 없습니다.
						{/if}
					</p>
				{/if}
			{/if}
		</form>
	</div>
{/each}

<svelte:head>
	<title>Hexapoda Renting Home</title>
</svelte:head>

<style>
	input {
		padding: 0.3rem;
		border: none;
		border-bottom: 1px solid #ccc;
		font-size: 0.9rem;
		width: 50%;
		box-sizing: border-box;
		outline: none;
		transition: border-color 0.3s ease;
	}

	input:focus {
		border-bottom: 1px solid #666;
	}

	button {
		padding: 0.3rem 0.6rem;
		border: none;
		border-radius: 4px;
		background-color: #f0f0f0;
		color: #333;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	button:hover {
		background-color: #e0e0e0;
	}

	button:active {
		background-color: #d0d0d0;
	}

	div {
		margin-bottom: 0.8rem;
	}
</style>
