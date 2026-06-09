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
