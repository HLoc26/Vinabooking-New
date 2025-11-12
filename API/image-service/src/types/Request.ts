import { type Request } from "express";
import { EEntityType } from "../../generated/prisma/index.js";
import type { ApiResponse, GetImageResponse, UploadResponse } from "./Response";

export type ImageEntityType = "profile" | "accommodation" | "room" | "review";

export const ImageUploadMapper: Record<ImageEntityType, EEntityType> = {
	profile: EEntityType.USER_PROFILE,
	accommodation: EEntityType.ACCOMMODATION,
	room: EEntityType.ROOM,
	review: EEntityType.REVIEW,
};

export interface UploadRequestType {
	type: ImageEntityType;
	id: string;
}

export type UploadRequest = Request<UploadRequestType, unknown, ApiResponse<UploadResponse>, unknown>;

export interface GetImageRequestType {
	type: ImageEntityType;
	id: string;
}

export type GetImagesRequest = Request<GetImageRequestType, unknown, ApiResponse<GetImageResponse>, unknown>;
