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

export function getDisabledDates(bookings: Booking[]): string[] {
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
