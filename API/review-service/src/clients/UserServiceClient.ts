import axios from "axios";
import { ApiResponse } from "../types/Response";
import NotFoundError from "../errors/NotFoundError";
import EnvironmentNotSetError from "../errors/EnvironmentNotSetError";
import { UserPayload } from "../types/User";

class UserServiceClient {
	private axiosInstance;
	constructor(private userServiceUrl: string) {
		if (!userServiceUrl) {
			throw new EnvironmentNotSetError("Missing environment variable BOOKING_ENDPOINT");
		}

		this.axiosInstance = axios.create({ baseURL: userServiceUrl });
	}

	public async getUser(id: string) {
		try {
			const res = await this.axiosInstance.get<ApiResponse<UserPayload>>(`/${id}`);
			if (!res.data || !res.data.data) throw new NotFoundError(`User with id ${id} not found`);
			const user = res.data.data;
			return { id: user.id, name: user.name };
		} catch (e: unknown) {
			const error = e as Error;
			console.error(error);
			throw error;
		}
	}
}

export default UserServiceClient;
