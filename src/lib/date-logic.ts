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
