import { EEntityType } from "@/modules/image/enums/EEntityType";

/** The URL token used on image routes (`/images/:type/:id`). */
export type EntityTypeParam = "profile" | "accommodation" | "room" | "review";

/** Maps a route `:type` token to its domain EEntityType. Mirrors the monolith `ImageUploadMapper`. */
export const ENTITY_TYPE_PARAM_MAP: Record<EntityTypeParam, EEntityType> = {
	profile: EEntityType.USER_PROFILE,
	accommodation: EEntityType.ACCOMMODATION,
	room: EEntityType.ROOM,
	review: EEntityType.REVIEW,
};
