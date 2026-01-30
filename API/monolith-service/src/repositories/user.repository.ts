import { PrismaClient, Prisma, User } from "@generated/client";
import { UserCreateWithoutFavouritesInput } from "@generated/models";
import { UserUpdateInput } from "../types/dtos/update-user.dto";
import { UserWithFavourites } from "../types/dtos/get-user.dto";

class UserRepository {
	readonly #prismaClient: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.#prismaClient = prismaClient;
	}

	// Overloading cases
	public async getByEmail<T extends boolean = false>(
		email: string,
		withFavourites: T // generic boolean
	) {
		return this.#findOne({ email }, withFavourites);
	}

	// Overloading cases
	public async getUserById<T extends boolean = false>(
		id: string,
		withFavourites: T // generic boolean
	) {
		return this.#findOne({ id }, withFavourites);
	}

	async #findOne<T extends boolean>(where: Prisma.UserWhereUniqueInput, withFavourites?: T): Promise<(T extends true ? UserWithFavourites : User) | null> {
		const queryOptions = {
			where,
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

		const user = await this.#prismaClient.user.findUnique(queryOptions);
		return user as (T extends true ? UserWithFavourites : User) | null;
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
				favourites: { include: { items: true } }, // include items though it will be empty
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
