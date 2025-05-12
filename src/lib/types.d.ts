interface RentInfo {
	renterName: string | null;
	rentalStartDate: string | null;
	rentalEndDate: string | null;
}

interface Item extends RentInfo {
	id: number;
	name: string;
	category: string;
	isRented: boolean;
}

interface BookInfo extends RentInfo {
	rentingItem: number;
}

interface Booking extends RentInfo {
	rentingItem: number;
	id: number;
}
