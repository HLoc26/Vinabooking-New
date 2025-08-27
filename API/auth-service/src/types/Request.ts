import { type Request } from "express";

import type { ParamsDictionary } from "express-serve-static-core";

export interface AuthRequestBody {
    username: string;
    password: string;
    email: string;
}

export type TypedRequest<T> = Request<ParamsDictionary, any, T>;
