import { EEntityType } from "../../generated/prisma/client";

import { EEntityType as GRPC_EEntityType } from "../../generated/grpc/image-service/image-service";

class MappingUtil {
	public static entityTypeMapping(type: EEntityType | GRPC_EEntityType): EEntityType {
		switch (type) {
			case GRPC_EEntityType.USER_PROFILE:
				return EEntityType.USER_PROFILE;
			case GRPC_EEntityType.ACCOMMODATION:
				return EEntityType.ACCOMMODATION;
			case GRPC_EEntityType.ROOM:
				return EEntityType.ROOM;
			case GRPC_EEntityType.REVIEW:
				return EEntityType.REVIEW;
			default:
				return type as EEntityType;
		}
	}
}

export default MappingUtil;
