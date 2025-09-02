export type CacheUserRequest = {
    cognitoSub: string;
    email: string;
};

export type CacheUserResponse = boolean | null;
