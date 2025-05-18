interface RentInfo {
	renterName: string;
	rentalStartDate: string;
	rentalEndDate: string;
}

interface Item {
	id: number;
	name: string;
	category: string;
}

interface BookInfo extends RentInfo {
	rentingItem: number;
}

interface Booking extends BookInfo {
	id: number;
}
