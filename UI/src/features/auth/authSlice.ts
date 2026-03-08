import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserDto } from "../user/types/UserDto";
import { authStorage } from "./utils/authStorage";

interface AuthState {
	user: UserDto | null;
	token: string | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	token: authStorage.getAccessToken() ?? null,
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
		},

		logoutSuccess: (state) => {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;
		},

		updateUserSync: (state, action: PayloadAction<UserDto>) => {
			state.user = action.payload;
		},
	},
});

export const { loginSuccess, logoutSuccess, updateUserSync } = authSlice.actions;
export default authSlice.reducer;
