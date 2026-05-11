import { formatVND } from "../utils/moneyConverter";

export const useCurrency = () => {
	return {
		format: formatVND,
	};
};
