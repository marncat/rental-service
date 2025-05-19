// Renamed function and parameters for better clarity
export function isEarlierThan(firstDate: Date, secondDate: Date) {
	return (
		new Date(
			firstDate.getFullYear(),
			firstDate.getMonth(),
			firstDate.getDate()
		) <
		new Date(
			secondDate.getFullYear(),
			secondDate.getMonth(),
			secondDate.getDate()
		)
	);
}

export function getCurrent(bookings: Map<number, RentInfo[]>) {
	const result = new Map();
	const today = new Date().toISOString().slice(0, 10);
	for (const [itemId, rents] of bookings.entries()) {
		const current = rents.find(
			(r) =>
				r.rentalStartDate &&
				r.rentalEndDate &&
				r.rentalStartDate <= today &&
				r.rentalEndDate >= today
		);
		if (current) {
			result.set(itemId, current);
		}
	}
	return result;
}

export function getDisabledDates(bookings: RentInfo[]): string[] {
	const dates: string[] = [];
	for (const b of bookings) {
		if (!b.rentalStartDate || !b.rentalEndDate) continue;
		const start = new Date(b.rentalStartDate);
		const end = new Date(b.rentalEndDate);
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			dates.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD 형식
		}
	}
	return dates;
}
