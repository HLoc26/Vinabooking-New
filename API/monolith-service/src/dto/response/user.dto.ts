import { UserRole } from "@/models/user";
import { FavouriteListDto } from "./favourite.dto";

export interface UserDto {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithFavouritesDto extends UserDto {
    favourites: FavouriteListDto[];
}
