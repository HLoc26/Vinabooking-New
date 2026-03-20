import { useState, useCallback } from "react";
import { TextField, Box, CircularProgress } from "@mui/material";
import debounce from "lodash.debounce";
import AddressSuggestions from "./AddressSuggestion";

export default function AddressInput({ address, onChange }: any) {
	const [loading, setLoading] = useState(false);
	const [suggestions, setSuggestions] = useState([]);

	const fetchSuggestions = useCallback(
		debounce(async (query: string) => {
			if (query.length < 3) return;
			setLoading(true);
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
					{ headers: { "User-Agent": "Vinabooking-App/1.0" } } // 🛡️ Required
				);
				const data = await res.json();
				setSuggestions(data);
			} catch (err) {
				console.error("Search failed", err);
			} finally {
				setLoading(false);
			}
		}, 800),
		[]
	);

	const handleSelect = (item: any) => {
		const addr = item.address || {};
		onChange({
			fullAddress: item.display_name,
			street: addr.road || addr.house_number || "",
			ward: addr.suburb || addr.village || addr.neighbourhood || "",
			district: addr.city_district || addr.county || "",
			city: addr.city || addr.town || "",
			country: addr.country || "",
			latitude: parseFloat(item.lat),
			longitude: parseFloat(item.lon),
		});
		setSuggestions([]);
	};

	return (
		<Box sx={{ position: "relative" }}>
			<TextField
				fullWidth
				label="Search Address"
				value={address.fullAddress || ""}
				onChange={(e) => {
					onChange({ fullAddress: e.target.value });
					fetchSuggestions(e.target.value);
				}}
				InputProps={{
					endAdornment: loading ? <CircularProgress size={20} /> : null,
				}}
			/>
			<AddressSuggestions items={suggestions} onSelect={handleSelect} />
		</Box>
	);
}
