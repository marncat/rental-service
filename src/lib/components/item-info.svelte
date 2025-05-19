<script lang="ts">
	import { isEarlierThan } from "$lib/date-logic";

	let {
		bookings,
		itemId,
	}: {
		bookings: Map<number, Booking[]>;
		itemId: number;
	} = $props();

	let initialBooking = $derived(bookings.get(itemId)?.at(0));
</script>

{#if initialBooking}
	{#if isEarlierThan(new Date(initialBooking.rentalEndDate), new Date())}
		<p
			style="margin-top: 8px; margin-bottom: 4px; color: #b71c1c; font-weight: bold; background: #ffebee; padding: 8px; border-radius: 4px; border: 1px solid #f44336;"
		>
			⚠️ 미반납된 품목입니다 - {initialBooking.renterName} (대여 종료일: {initialBooking.rentalEndDate!})
		</p>
	{:else if !isEarlierThan(new Date(), new Date(initialBooking.rentalStartDate))}
		<p style="margin-top: 8px; margin-bottom: 4px">
			🔒 대여 중 - {initialBooking.renterName} (대여 종료일: {initialBooking.rentalEndDate!})
		</p>
	{:else}
		<p style="margin-top: 8px; margin-bottom: 16px">✅ 대여 가능</p>
	{/if}
{:else}
	<p style="margin-top: 8px; margin-bottom: 16px">✅ 대여 가능</p>
{/if}
