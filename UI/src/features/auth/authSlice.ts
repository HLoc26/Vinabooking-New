import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserDto } from "../../types/UserDto";

interface AuthState {
	user: UserDto | null;
	token: string | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	token: localStorage.getItem("accessToken"),
	isAuthenticated: !!localStorage.getItem("accessToken"),
	user: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginSuccess: (state, action: PayloadAction<{ token: string; user: UserDto }>) => {
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
			localStorage.setItem("accessToken", action.payload.token);
		},
		updateUserSync: (state, action: PayloadAction<UserDto>) => {
			state.user = action.payload;
		},
	},
});

export const { loginSuccess, updateUserSync } = authSlice.actions;

export default authSlice.reducer;
