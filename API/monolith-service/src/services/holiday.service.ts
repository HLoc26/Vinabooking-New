import HolidayRepository from "@/repositories/holiday.repository";
import { Holiday } from "@/models/holiday";
import { HolidayDto } from "@/dto/response/holiday.dto";

class HolidayService {
    readonly #holidayRepository: HolidayRepository;

    constructor(holidayRepository: HolidayRepository) {
        this.#holidayRepository = holidayRepository;
    }

    public async getHolidayCatalog(): Promise<HolidayDto[]> {
        const holidays = await this.#holidayRepository.findAll();
        return this.mapToDto(holidays);
    }

    /**
     * Get accommodation holiday opt-ins (for PricingService).
     */
    public async getAccommodationHolidayOptIns(accommodationId: string) {
        return await this.#holidayRepository.findByAccommodation(accommodationId);
    }

    /**
     * Find holiday anchors by codes within a date range (for PricingService).
     */
    public async findHolidayAnchorsByCodes(codes: string[], startDate: Date, endDate: Date): Promise<Holiday[]> {
        return await this.#holidayRepository.findAnchorsByCodes(codes, startDate, endDate);
    }

    public mapToDto(holidays: Holiday[]): HolidayDto[] {
        return holidays.map(h => ({
            id: h.getId(),
            name: h.getName(),
            code: h.getCode(),
            date: h.getDate(),
            isRecurring: h.getIsRecurring()
        }));
    }
}

export default HolidayService;
