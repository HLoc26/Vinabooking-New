import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import searchReducer from "../features/search/searchSlice";
import bookingReducer from "../features/booking/bookingSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore, createTransform } from "redux-persist";
import { parseInputDate, toInputDate } from "../utils/dateFormatter";

/* ===============================
   Date Transform
================================ */
type RecursiveDateState = Date | string | number | boolean | null | undefined | { [key: string]: RecursiveDateState } | RecursiveDateState[];

const dateTransform = createTransform<RecursiveDateState, RecursiveDateState>(
	// 1. Inbound: Date -> "YYYY-MM-DD"
	(inboundState) => {
		const convert = (obj: RecursiveDateState): RecursiveDateState => {
			// Case 1: Đối tượng Date (Xử lý ngay)
			if (obj instanceof Date) {
				return toInputDate(obj);
			}
			// Case 2: Mảng (Duyệt đệ quy)
			if (Array.isArray(obj)) {
				return obj.map(convert);
			}
			// Case 3: Object (Kiểm tra kỹ để tránh Date hoặc Null)
			if (typeof obj === "object" && obj !== null) {
				const newObj: { [key: string]: RecursiveDateState } = {};
				// Ép kiểu sang Record để TypeScript cho phép index bằng string
				const record = obj as Record<string, RecursiveDateState>;

				Object.keys(record).forEach((key) => {
					newObj[key] = convert(record[key]);
				});
				return newObj;
			}
			// Case 4: Primitive (string, number, boolean, etc.)
			return obj;
		};
		return convert(inboundState);
	},

	// 2. Outbound: "YYYY-MM-DD" -> Date
	(outboundState) => {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

		const revive = (value: RecursiveDateState): RecursiveDateState => {
			if (typeof value === "string" && dateRegex.test(value)) {
				return parseInputDate(value);
			}
			if (Array.isArray(value)) {
				return value.map(revive);
			}
			if (typeof value === "object" && value !== null) {
				const newObj: { [key: string]: RecursiveDateState } = {};
				const record = value as Record<string, RecursiveDateState>;

				Object.keys(record).forEach((key) => {
					newObj[key] = revive(record[key]);
				});
				return newObj;
			}
			return value;
		};
		return revive(outboundState);
	}
);

/* ===============================
   Persist Config (Slice Level)
================================ */

const bookingPersistConfig = {
	key: "booking",
	storage,
	transforms: [dateTransform],
};

const searchPersistConfig = {
	key: "search",
	storage,
	transforms: [dateTransform],
};

/* ===============================
   Persisted Reducers
================================ */

const persistedBookingReducer = persistReducer(bookingPersistConfig, bookingReducer);
const persistedSearchReducer = persistReducer(searchPersistConfig, searchReducer);

/* ===============================
   Store
================================ */

export const store = configureStore({
	reducer: {
		auth: authReducer,
		search: persistedSearchReducer,
		booking: persistedBookingReducer,
	},
	//Let redux ignore non-serial stuff bla bla bla
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
				ignoredActionPaths: [/payload/],
				ignoredPaths: [/search\.dates/, /booking/],
			},
		}),
});

export const persistor = persistStore(store);

/* ===============================
   Types
================================ */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
