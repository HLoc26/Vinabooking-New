import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import searchReducer from "../features/search/searchSlice";
import bookingReducer from "../features/booking/bookingSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore, createTransform } from "redux-persist";

/* ===============================
   Booking Date Transform
================================ */

const bookingDateTransform = createTransform(
	// Before saving to storage (Date → string)
	(inboundState: any) => ({
		...inboundState,
		startDate: inboundState.startDate?.toISOString?.() ?? inboundState.startDate,
		endDate: inboundState.endDate?.toISOString?.() ?? inboundState.endDate,
	}),

	// After loading from storage (string → Date)
	(outboundState: any) => ({
		...outboundState,
		startDate: new Date(outboundState.startDate),
		endDate: new Date(outboundState.endDate),
	})
);

/* ===============================
   Persist Config (Slice Level)
================================ */

const bookingPersistConfig = {
	key: "booking",
	storage,
	transforms: [bookingDateTransform],
};

/* ===============================
   Persisted Reducers
================================ */

const persistedBookingReducer = persistReducer(bookingPersistConfig, bookingReducer);

/* ===============================
   Store
================================ */

export const store = configureStore({
	reducer: {
		auth: authReducer,
		search: searchReducer,
		booking: persistedBookingReducer,
	},
	//Let redux ignore non-serial stuff bla bla bla
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredPaths: ["booking.startDate", "booking.endDate"],
			},
		}),
});

export const persistor = persistStore(store);

/* ===============================
   Types
================================ */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
