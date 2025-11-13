import axios, { type AxiosInstance } from "axios";

export class UserAxiosClient {
	static #axiosInstance: AxiosInstance;

	constructor() {}

	public static getInstance() {
		if (!UserAxiosClient.#axiosInstance) {
			UserAxiosClient.#axiosInstance = axios.create({
				baseURL: process.env["USER_ENDPOINT"]!,
				responseType: "json",
				timeout: 10000,
			});
		}
		return UserAxiosClient.#axiosInstance;
	}
}

// Will implement this if use gRPC
// export class UserGrpcClient { }
