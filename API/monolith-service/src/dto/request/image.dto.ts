import { type Request } from "express";
import { EEntityType } from "@/generated/enums";


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

export type UploadRequest = Request<UploadRequestType>;

export interface GetImageRequestType {
	type: ImageEntityType;
	id: string;
}

export type GetImagesRequest = Request<GetImageRequestType>;

export interface DeleteImageRequestType {
	id: string;
}

export type DeleteImageRequest = Request<DeleteImageRequestType>;
