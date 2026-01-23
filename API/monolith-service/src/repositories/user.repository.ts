import { User } from "@generated/browser";
import { PrismaClient } from "@generated/client";
import { UserCreateWithoutFavouritesInput } from "@generated/models";
import { UserUpdateInput } from "../types/dtos/update-user.dto";
import { UserWithFavourites } from "../types/dtos/get-user.dto";

class UserRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async getByEmail(email: string, withFavourites: boolean = false): Promise<User | null> {
		const queryOptions = {
			where: { email },
			include: {},
		};

		if (withFavourites) {
			queryOptions.include = {
				favourites: {
					include: {
						items: true,
					},
				},
			};
		}

		return await this.#prismaClient.user.findUnique(queryOptions);
	}

	public async getUserById(id: string, withFavourites: boolean = false): Promise<User | null> {
		const queryOptions = {
			where: { id },
			include: {},
		};

		if (withFavourites) {
			queryOptions.include = {
				favourites: {
					include: {
						items: true,
					},
				},
			};
		}

		return await this.#prismaClient.user.findUnique(queryOptions);
	}

	public async createUser(input: UserCreateWithoutFavouritesInput): Promise<UserWithFavourites> {
		const user = await this.#prismaClient.user.create({
			data: {
				...input,
				favourites: {
					create: {
						name: "My Favourite List",
					},
				},
			},
			include: {
				favourites: true,
			},
		});

		return user;
	}

	public async updateUser(id: string, data: UserUpdateInput): Promise<User> {
		const user = await this.#prismaClient.user.update({
			where: { id },
			data: {
				name: data.name,
				phone: data.phone,
			},
		});
		return user;
	}
}

export default UserRepository;
