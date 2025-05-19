<script lang="ts">
	import { enhance } from "$app/forms";
	import ItemInfo from "$lib/components/item-info.svelte";
	import { getCurrent, getDisabledDates } from "$lib/date-logic";
	import flatpickr from "flatpickr";
	import type { Instance } from "flatpickr/dist/types/instance";
	import { onMount } from "svelte";

	let form = $state({ name: "", category: "" });
	let items: Item[] = $state([]);

	let bookings: Map<number, Booking[]> = $state(new Map());
	let currentRents: Map<number, RentInfo> = $derived(getCurrent(bookings));
	let waitingItems: number[] = $state([]);
	let flatpickrs: Map<number, Instance> = new Map();

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

	async function deleteItem(itemId: number) {
		if (confirm("정말로 이 품목을 삭제하시겠습니까?")) {
			await fetch(`/api/items/${itemId}`, {
				method: "DELETE",
			});
			await fetchItems();
			alert("품목이 삭제되었습니다.");
		}
	}

	async function deleteBooking(bookingId: number) {
		await fetch(`/api/bookings/${bookingId}`, {
			method: "DELETE",
		});
		await fetchBookings();
	}

	async function updateBooking(booking: Booking, value: Date[]) {
		const [rentalStartDateRaw, rentalEndDateRaw] = value;
		let d1 = new Date(rentalStartDateRaw);
		let d2 = rentalEndDateRaw ? new Date(rentalEndDateRaw) : new Date(d1);
		d1.setDate(d1.getDate() + 1);
		d2.setDate(d2.getDate() + 1);

		// rentalStartDateRaw.setDate(rentalStartDateRaw.getDate() + 1);
		let rentalStartDate = d1.toISOString().slice(0, 10);

		let rentalEndDate = d2.toISOString().slice(0, 10);

		await fetch(`api/bookings/${booking.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				renterName: booking.renterName,
				rentalStartDate,
				rentalEndDate,
			}),
		});
		await fetchBookings();
	}

	async function fetchBookings() {
		const res = await fetch("/api/bookings");
		const data = await res.json();
		bookings = data.reduce(
			(map: Map<number, Booking[]>, booking: Booking) =>
				map.set(booking.rentingItem, [
					...(map.get(booking.rentingItem) || []),
					booking,
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

<div
	style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 1rem;"
>
	<h1>🐞 헥사포다 관리자</h1>
	<form action="/admin/logout" method="POST" use:enhance>
		<button type="submit" style="margin-right: auto;">로그아웃</button>
	</form>
</div>

<h2>📋 품목 추가</h2>
<div style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 2rem; ">
	<form onsubmit={addItem}>
		<div>
			품목 이름: <input bind:value={form.name} required />
		</div>
		<div>
			분류: <input bind:value={form.category} required />
		</div>
		<button type="submit">추가</button>
	</form>
</div>

<h2>📋 전체 품목 목록</h2>

{#each items as item}
	<div class="item">
		<strong>{item.name}</strong> ({item.category})<br />

		{#if waitingItems.includes(item.id)}
			처리 중...
		{:else}
			<div style="margin-top: 8px;">
				<ItemInfo {currentRents} itemId={item.id} />
				<button onclick={() => deleteItem(item.id)}>삭제</button>
			</div>
		{/if}
		<div>
			{#if (bookings.get(item.id) ?? []).length > 0}
				<details
					style="margin-bottom:16px; margin-left:16px; margin-top:8px"
				>
					<summary
						>📅 예약: {(bookings.get(item.id) ?? [])
							.length}</summary
					>
					<ul style="margin-top: 8px">
						{#each bookings.get(item.id) ?? [] as booking}
							<li style="margin-bottom: 8px;">
								<strong>{booking.renterName}</strong>
								<input
									type="text"
									name="date"
									id={`range${item.id}-${booking.id}`}
									value={booking.rentalStartDate ===
									booking.rentalEndDate
										? booking.rentalStartDate
										: `${booking.rentalStartDate} to ${booking.rentalEndDate}`}
									onfocus={() => {
										if (flatpickrs.has(item.id)) {
											const fp = flatpickrs.get(item.id);
											fp?.destroy();
										}
										const fp = flatpickr(
											`#range${item.id}-${booking.id}`,
											{
												mode: "range",
												minDate: "today",
												dateFormat: "Y-m-d",
												disable: getDisabledDates(
													(
														bookings.get(item.id) ??
														[]
													).filter((b) => {
														return (
															b.id !== booking.id
														);
													})
												),
												onValueUpdate: async (
													value
												) => {
													await updateBooking(
														booking,
														value
													);
												},
											}
										);
										flatpickrs.set(item.id, fp as Instance);
									}}
								/>
								<button
									onclick={() => deleteBooking(booking.id)}
								>
									삭제
								</button>
							</li>
						{/each}
					</ul>
				</details>
			{/if}
		</div>
	</div>
{/each}

<svelte:head>
	<title>Hexapoda Renting Manage</title>
</svelte:head>

<style>
	input {
		padding: 0.3rem;
		border: none;
		border-bottom: 1px solid #ccc;
		font-size: 0.9rem;
		width: 50%;
		box-sizing: border-box;
		margin-bottom: 0.8rem;
		outline: none;
		transition: border-color 0.3s ease;
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

	input:focus {
		border-bottom: 1px solid #666;
	}

	button:hover {
		background-color: #e0e0e0;
	}

	button:active {
		background-color: #d0d0d0;
	}

	.item {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.8rem;
		margin: 0.8rem 0;
	}
</style>
