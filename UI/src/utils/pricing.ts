import type { AccommodationDetail } from "../features/accommodation/types/accommodation.types";
import type { Room } from "../features/accommodation/types/room.types";

/**
 * Tính giá thấp nhất của một phòng.
 * Logic: Ưu tiên giá phòng -> Nếu không có thì lấy giá thấp nhất của giường.
 */
export const calculateRoomMinPrice = (room: Room): number => {
	// 1. Kiểm tra giá của Room trước
	// Lưu ý: room.price là string nên cần parse, và check khác rỗng
	if (room.price && room.price.trim() !== "") {
		const price = parseFloat(room.price);
		if (!isNaN(price)) {
			return price;
		}
	}

	// 2. Nếu không có giá Room, tìm giá thấp nhất trong danh sách Beds
	if (room.beds && room.beds.length > 0) {
		// Lọc ra các giường có giá hợp lệ (không null)
		const bedPrices = room.beds.map((bed) => bed.price).filter((p): p is number => p !== null && typeof p === "number");

		if (bedPrices.length > 0) {
			return Math.min(...bedPrices);
		}
	}

	// Trả về Infinity để đánh dấu là không tính được giá (để lọc ra sau này)
	return Infinity;
};

/**
 * Tính giá hiển thị (min price) cho toàn bộ Accommodation
 */
export const getAccommodationMinPrice = (accommodation: AccommodationDetail): number => {
	if (!accommodation.rooms || accommodation.rooms.length === 0) {
		return 0;
	}

	// Tính giá cho từng room
	const prices = accommodation.rooms.map(calculateRoomMinPrice);

	// Lọc bỏ các giá trị Infinity (các phòng không có giá)
	const validPrices = prices.filter((p) => p !== Infinity);

	if (validPrices.length === 0) {
		return 0; // Hoặc null tùy logic hiển thị của bạn
	}

	const round = Math.round(Math.min(...validPrices));

	// Tìm giá nhỏ nhất
	return round - (round % 10);
};
