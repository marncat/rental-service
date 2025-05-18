<script lang="ts">
	import { isEarlierThan } from "$lib/date-logic";

	let {
		currentRents,
		itemId,
	}: { currentRents: Map<number, RentInfo>; itemId: number } = $props();

	let item = $derived(currentRents.get(itemId));
</script>

{#if currentRents.has(itemId)}
	<p style="margin-top: 8px; margin-bottom: 4px">
		{#if isEarlierThan(new Date(item?.rentalEndDate!), new Date())}
			🔓 대여 기한 초과 - {item?.renterName} (대여 종료일:
			{item?.rentalEndDate!})
		{:else}
			🔒 대여 중 - {item?.renterName} (대여 종료일: {item?.rentalEndDate!})
		{/if}
	</p>
{:else}
	<p style="margin-top: 8px; margin-bottom: 16px">✅ 대여 가능</p>
{/if}
