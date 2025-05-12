interface Item {
	id: number;
	name: string;
	category: string;
	isRented: boolean;
	renterName: string | null;
	rentalStartDate: string | null;
	rentalEndDate: string | null;
}
