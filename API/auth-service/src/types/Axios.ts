export type CacheInfo = {
    email: string;
    info: {
        cognitoSub: string;
        name: string;
        phone: string;
        userType: "TRAVELLER" | "ACCOMMODATION_OWNER";
    };
};

export type CacheUserResponse = boolean | null;
