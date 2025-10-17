import FavouriteList from "./FavouriteList";
import type { User as UserSchema } from "../../generated/prisma/index.js";
import { EUserRole, type IUser, type UserWithFavourites } from "../types/User";

class User {
    #id: string;
    #name: string;
    #phone: string;
    #role: EUserRole;

    #favouriteLists?: Array<FavouriteList>;

    readonly #createdAt: Date;
    #updatedAt?: Date;

    constructor(props: IUser) {
        this.#id = props.id;
        this.#name = props.name;
        this.#phone = props.phone;

        const roleMap: Record<string, EUserRole> = {
            Traveller: EUserRole.TRAVELLER,
            AccommodationOwner: EUserRole.ACCOMMODATION_OWNER,
        };
        const role = roleMap[props.role];
        if (!role) throw new Error(`Type mismatch: role ${props.role} should be either "Traveller" or "AccommodationOwner"`);
        this.#role = role;

        this.#favouriteLists = props.favouriteLists?.map((list) => new FavouriteList(list)) ?? new Array<FavouriteList>();
        this.#createdAt = props.createdAt ?? new Date();
        this.#updatedAt = props.updatedAt ?? new Date();
    }

    public static fromSchema(schema: UserWithFavourites | UserSchema) {
        let favourites;
        if ("favourites" in schema && schema.favourites) {
            favourites = schema.favourites.map((list) => FavouriteList.fromSchema(list));
        }

        return new User({
            id: schema.id,
            name: schema.name,
            phone: schema.phone,
            role: schema.role,
            favouriteLists: favourites ?? [],
            createdAt: schema.createdAt,
            updatedAt: schema.updatedAt,
        });
    }

    public toJson() {
        return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            role: this.role,
            favourites: this.favouriteLists?.map((list) => list.toJson()),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    // Getters and setters
    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get phone() {
        return this.#phone;
    }
    get role() {
        return this.#role;
    }
    get favouriteLists() {
        return this.#favouriteLists;
    }
    get createdAt() {
        return this.#createdAt;
    }
    get updatedAt() {
        return this.#updatedAt ?? this.#createdAt!;
    }
    set name(newName: string) {
        this.#name = newName;
        this.#updatedAt = new Date();
    }
    set phone(newPhone: string) {
        if (!/^\d+$/.test(newPhone)) throw new Error("Invalid phone number");
        this.#phone = newPhone;
        this.#updatedAt = new Date();
    }
    set role(newRole: EUserRole) {
        this.#role = newRole;
        this.#updatedAt = new Date();
    }
}

export default User;
