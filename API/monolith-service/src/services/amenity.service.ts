import AmenityRepository from "@/repositories/amenity.repository";
import { Amenity, AmenityType } from "@/models/amenity";
import { AmenityDto } from "@/dto/response/amenity.dto";

class AmenityService {
    readonly #amenityRepository: AmenityRepository;

    constructor(amenityRepository: AmenityRepository) {
        this.#amenityRepository = amenityRepository;
    }

    public async getAllAmenities(): Promise<AmenityDto[]> {
        const amenities = await this.#amenityRepository.findAll();
        return this.mapToDto(amenities);
    }

    public async getAmenityById(id: string): Promise<AmenityDto | null> {
        const amenity = await this.#amenityRepository.findById(id);
        if (!amenity) return null;
        return this.mapToDto([amenity])[0];
    }
    
    public async getAmenitiesByType(type: AmenityType): Promise<AmenityDto[]> {
        const amenities = await this.#amenityRepository.findByType(type);
        return this.mapToDto(amenities);
    }

    public mapToDto(amenities: Amenity[]): AmenityDto[] {
        return amenities.map(a => ({
            id: a.getId(),
            name: a.getName(),
            type: a.getType(),
            description: a.getDescription(),
            createdAt: a.getCreatedAt(),
            updatedAt: a.getUpdatedAt()
        }));
    }
}

export default AmenityService;
