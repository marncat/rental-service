<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemInfo from "$lib/components/item-info.svelte";
	import { getDisabledDates, isEarlierThan } from "$lib/date-logic";
	import flatpickr from "flatpickr";
	import type { Instance } from "flatpickr/dist/types/instance";
	import { onMount } from "svelte";

	let items: Item[] = $state([]);
	let bookings: Map<number, Booking[]> = $state(new Map());

	let waitingItems: number[] = $state([]);
	let flatpickrs: Map<number, Instance> = new Map();

	async function fetchItems() {
		const res = await fetch("/api/items");
		const data = await res.json();
		items = data;
	}

	async function fetchBookings() {
		const res = await fetch("/api/bookings");
		const data = await res.json();
		bookings = data.reduce(
			(map: Map<number, Booking[]>, booking: Booking) => {
				const arr = [...(map.get(booking.rentingItem) || []), booking];
				arr.sort((a, b) =>
					isEarlierThan(
						new Date(a.rentalStartDate),
						new Date(b.rentalStartDate)
					)
						? -1
						: 1
				);
				return map.set(booking.rentingItem, arr);
			},
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
			<ItemInfo {bookings} itemId={item.id} />
			{#if waitingItems.includes(item.id)}
				처리 중...
			{:else}
				{#if (bookings.get(item.id) ?? []).length > 0}
					<details style="margin-bottom:16px; margin-left:16px">
						<summary>
							📅 예약: {(bookings.get(item.id) ?? []).length}
						</summary>
						<ul style="margin-top: 0">
							{#each bookings.get(item.id) ?? [] as booking}
								<li>
									<strong>{booking.renterName}</strong> -
									{#if booking.rentalStartDate === booking.rentalEndDate}
										{booking.rentalStartDate}
									{:else}
										{booking.rentalStartDate}
										to {booking.rentalEndDate}
									{/if}
								</li>
							{/each}
						</ul>
					</details>
				{/if}
				<div class="reservation-form">
					<input name="itemId" value={item.id} type="hidden" />
					<div class="form-row">
						<label for={`name${item.id}`}>이름</label>
						<input name="name" id={`name${item.id}`} required />
					</div>
					<div class="form-row">
						<label for={`range${item.id}`}>예약 기간</label>
						<input
							type="text"
							name="date"
							id={`range${item.id}`}
							placeholder="YYYY-MM-DD to YYYY-MM-DD"
							onfocus={() => {
								if (flatpickrs.has(item.id)) {
									const fp = flatpickrs.get(item.id);
									fp?.destroy();
								}
								const fp = flatpickr(`#range${item.id}`, {
									mode: "range",
									minDate: "today",
									dateFormat: "Y-m-d",
									disable: getDisabledDates(
										bookings.get(item.id) ?? []
									),
								});
								flatpickrs.set(item.id, fp as Instance);
							}}
						/>
					</div>
					<div class="form-row" style="justify-content: flex-end;">
						<button type="submit"> 예약하기 </button>
					</div>
				</div>
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
