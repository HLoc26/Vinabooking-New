import axios, { type AxiosInstance } from "axios";

export class UserAxiosClient {
    static #axiosInstance: AxiosInstance;

    constructor() {}

    public static getInstance() {
        if (!this.#axiosInstance) {
            this.#axiosInstance = axios.create({
                baseURL: process.env["USER_ENDPOINT"]!,
                responseType: "json",
                timeout: 10000,
            });
        }
        return this.#axiosInstance;
    }
}

// Will implement this if use gRPC
// export class UserGrpcClient { }
