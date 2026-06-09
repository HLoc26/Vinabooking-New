import FacilityRepository from "@/repositories/facility.repository";
import { Facility } from "@/models/facility";
import { FacilityDto } from "@/dto/response/facility.dto";

class FacilityService {
    readonly #facilityRepository: FacilityRepository;

    constructor(facilityRepository: FacilityRepository) {
        this.#facilityRepository = facilityRepository;
    }

    public async getAllFacilities(): Promise<FacilityDto[]> {
        const facilities = await this.#facilityRepository.findAll();
        return this.mapToDto(facilities);
    }

    public async getFacilityById(id: string): Promise<FacilityDto | null> {
        const facility = await this.#facilityRepository.findById(id);
        if (!facility) return null;
        return this.mapToDto([facility])[0];
    }

    public mapToDto(facilities: Facility[]): FacilityDto[] {
        return facilities.map(f => ({
            id: f.getId(),
            name: f.getName(),
            type: f.getType(),
            description: f.getDescription(),
            createdAt: f.getCreatedAt(),
            updatedAt: f.getUpdatedAt()
        }));
    }
}

export default FacilityService;
