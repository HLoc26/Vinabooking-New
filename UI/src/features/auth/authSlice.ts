import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserDto } from "../user/types/UserDto";
import { authStorage } from "./utils/authStorage";
import type { OwnerProfileData } from "../owner/types/owner.types";

interface AuthState {
	user: UserDto | null;
	ownerProfile: OwnerProfileData | null;
	token: string | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	token: authStorage.getAccessToken() ?? null,
	ownerProfile: authStorage.getOwnerProfileSync<OwnerProfileData>(),
	user: authStorage.getUserSync<UserDto>(),
	isAuthenticated: !!authStorage.getAccessToken(),
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginSuccess: (state, action: PayloadAction<{ token: string; user: UserDto }>) => {
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
			authStorage.setAccessToken(action.payload.token);
			authStorage.setUser(action.payload.user);
		},

		logoutSuccess: (state) => {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;
			authStorage.clearAccessToken();
			authStorage.clearUser();
		},

		updateUserSync: (state, action: PayloadAction<UserDto>) => {
			state.user = action.payload;
			authStorage.setUser(action.payload);
		},

		setOwnerProfile: (state, action: PayloadAction<OwnerProfileData>) => {
			state.ownerProfile = action.payload;
		},
	},
});

export const { loginSuccess, logoutSuccess, updateUserSync, setOwnerProfile } = authSlice.actions;
export default authSlice.reducer;
