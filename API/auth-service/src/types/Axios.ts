export type CacheInfo = {
    email: string;
    info: {
        cognitoSub: string;
        name: string;
        phone: string;
    };
};

export type CacheUserResponse = boolean | null;
