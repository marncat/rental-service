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
