import { ETokenType } from "../types/Request";

import { ETokenType as GRPC_ETokenType } from "../../generated/grpc/auth-service/auth-service";

class MappingUtil {
	public static tokenTypeMapping(type: ETokenType | GRPC_ETokenType): ETokenType {
		switch (type) {
			case GRPC_ETokenType.ACCESS:
				return ETokenType.ACCESS;
			case GRPC_ETokenType.ID:
				return ETokenType.ID;
			default:
				return type as ETokenType;
		}
	}
}

export default MappingUtil;
