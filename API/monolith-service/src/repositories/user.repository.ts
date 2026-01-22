import { ERole, User } from "@generated/browser";
import { PrismaClient } from "@generated/client";
import CreateUserDto from "../types/dtos/create-user.dto";

class UserRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	public async getByEmail(email: string, withFavourites: boolean = false): User {
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

		return this.#prismaClient.user.findUnique(queryOptions);
	}

	public async getUserById(id: string, withFavourites: boolean = false): User {
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

	public async createUser(id: string, name: string, email: string, phone: string, role: ERole) {
		const user = await this.#prismaClient.user.create({
			data: {
				id: id,
				name: name,
				email: email,
				phone: phone,
				role: role,
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

	public async updateUser(id: string, data: CreateUserDto) {
		return await this.#prismaClient.user.update({
			where: { id },
			data: {
				name: data.name,
				phone: data.phone,
			},
		});
	}
}

export default UserRepository;
