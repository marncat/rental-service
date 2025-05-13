<script lang="ts">
	import { enhance } from "$app/forms";
	import { isEarlierThan } from "$lib/date-logic";
	import { onMount } from "svelte";

	let form = $state({ name: "", category: "" });
	let items: Item[] = $state([]);
	let bookings: Map<number, Booking[]> = $state(new Map());

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
		if (bookings.get(itemId)) {
			const booking: Booking = bookings.get(itemId)?.shift()!;
			await fetch(`/api/items/${itemId}`, {
				method: "PATCH",
				body: JSON.stringify({
					isRented: true,
					renterName: booking.renterName,
					rentalStartDate: booking.rentalStartDate,
					rentalEndDate: booking.rentalEndDate,
				}),
			});
			await fetch(`/api/bookings/${booking.id}`, {
				method: "DELETE",
			});
		} else {
			await fetch(`/api/items/${itemId}`, {
				method: "PATCH",
				body: JSON.stringify({
					isRented: false,
					renterName: null,
					rentalStartDate: null,
					rentalEndDate: null,
				}),
			});
		}
		await sync();
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
	style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
>
	<h1>관리자</h1>
	<form action="/admin/logout" method="POST" use:enhance>
		<button type="submit">로그아웃</button>
	</form>
</div>

<h2>📋 품목 추가</h2>
<div style="border: 1px solid #ccc; padding: 1rem; margin-bottom: 2rem; ">
	<form onsubmit={addItem}>
		품목 이름: <input bind:value={form.name} required />
		분류: <input bind:value={form.category} required />
		<button type="submit">추가</button>
	</form>
</div>

<h2>📋 전체 품목 목록</h2>

{#each items as item}
	<div style="border: 1px solid #ccc; padding: 1rem; margin: 1rem 0;">
		<div>
			<strong>{item.name}</strong> ({item.category})<br />

			{#if item.isRented}
				{#if isEarlierThan(new Date(item.rentalEndDate!), new Date())}
					🔓 대여 기한 초과 - {item.renterName} (대여 종료일: {item.rentalEndDate})
				{:else}
					🔒 대여 중 - {item.renterName} (대여 종료일: {item.rentalEndDate})
				{/if}
				<button onclick={() => returnItem(item.id)}>반납 처리</button>
			{:else}
				✅ <b>대여 가능</b>
			{/if}
			<button
				onclick={() => deleteItem(item.id)}
				style="background: none; border: none; cursor: pointer;"
			>
				🗑️
			</button>
		</div>
		<div>
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
									<strong>{booking.renterName}</strong> - 대여
									종료일: {booking.rentalEndDate}
									<button
										onclick={() =>
											deleteBooking(booking.id)}
										style="background: none; border: none; cursor: pointer;"
									>
										🗑️
									</button>
								</li>
							{/each}
						</ul>
					</details>
				{/if}
			{/if}
		</div>
	</div>
{/each}
