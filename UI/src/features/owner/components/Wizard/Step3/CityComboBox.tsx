import { useState, useRef, useEffect, useCallback } from "react";
import { Box, TextField, Paper, List, ListItemButton, Radio, Typography, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface Props {
	label?: string;
	value: string;
	country: string; // e.g. "Vietnam" — passed to Nominatim as countrycodes
	countryCode: string; // ISO alpha-2, e.g. "VN"
	onChange: (city: string) => void;
	disabled?: boolean;
}

// Tiny static fallback so the dropdown isn't empty on first load
const STATIC_FALLBACK: Record<string, string[]> = {
	VN: ["Ho Chi Minh City", "Ha Noi", "Da Nang", "Can Tho", "Hai Phong"],
	TH: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
	JP: ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
	KR: ["Seoul", "Busan", "Incheon"],
	SG: ["Singapore"],
	MY: ["Kuala Lumpur", "Penang", "Johor Bahru"],
	ID: ["Jakarta", "Bali", "Surabaya", "Bandung"],
	AU: ["Sydney", "Melbourne", "Brisbane", "Perth"],
	US: ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
	GB: ["London", "Manchester", "Birmingham", "Edinburgh"],
	FR: ["Paris", "Lyon", "Marseille", "Nice"],
	DE: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
};

async function fetchCities(query: string, countryCode: string): Promise<string[]> {
	if (!countryCode) return [];
	const code = countryCode.toLowerCase();

	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("format", "json");
	url.searchParams.set("q", query || "city");
	url.searchParams.set("countrycodes", code);
	url.searchParams.set("featureType", "city");
	url.searchParams.set("addressdetails", "0");
	url.searchParams.set("limit", "8");
	url.searchParams.set("dedupe", "1");

	const res = await fetch(url.toString(), {
		headers: { "User-Agent": "Vinabooking-App/1.0" },
	});
	if (!res.ok) throw new Error(`Nominatim ${res.status}`);

	const data: any[] = await res.json();

	// Extract city name: prefer display_name split or name field
	const names = data.map((item) => item.name || item.display_name?.split(",")[0]?.trim() || "").filter(Boolean);

	// Dedupe
	return [...new Set(names)];
}

export default function CityComboBox({ label = "City", value, country, countryCode, onChange, disabled = false }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [options, setOptions] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Reset when country changes
	useEffect(() => {
		setOptions(STATIC_FALLBACK[countryCode] || []);
		setQuery("");
	}, [countryCode]);

	// Fetch from Nominatim with 400ms debounce
	const search = useCallback(
		async (q: string) => {
			if (!countryCode) return;
			setLoading(true);
			try {
				const results = await fetchCities(q, countryCode);
				setOptions(results.length > 0 ? results : STATIC_FALLBACK[countryCode] || []);
			} catch {
				setOptions(STATIC_FALLBACK[countryCode] || []);
			} finally {
				setLoading(false);
			}
		},
		[countryCode]
	);

	useEffect(() => {
		if (!open) return;
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => search(query), 400);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, open, search]);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleOpen = () => {
		if (disabled) return;
		setOpen((p) => !p);
		if (!open && options.length === 0) search("");
	};

	const handleSelect = (city: string) => {
		onChange(city);
		setOpen(false);
		setQuery("");
	};

	return (
		<Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
			<TextField
				fullWidth
				label={label}
				value={value}
				placeholder={disabled ? "Select country first" : "Search city..."}
				disabled={disabled}
				onClick={handleOpen}
				onChange={(e) => {
					onChange(e.target.value);
					setQuery(e.target.value);
					if (!open) setOpen(true);
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{loading ? (
								<CircularProgress size={16} />
							) : (
								<KeyboardArrowDownIcon
									onClick={(e) => {
										e.stopPropagation();
										handleOpen();
									}}
									sx={{
										transition: "transform 0.2s",
										transform: open ? "rotate(180deg)" : "rotate(0deg)",
										color: disabled ? "text.disabled" : "text.secondary",
										fontSize: 20,
										cursor: disabled ? "default" : "pointer",
									}}
								/>
							)}
						</InputAdornment>
					),
				}}
			/>

			{open && !disabled && (
				<Paper
					elevation={8}
					sx={{
						position: "absolute",
						top: "calc(100% + 6px)",
						left: 0,
						right: 0,
						zIndex: 1400,
						borderRadius: 2,
						overflow: "hidden",
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					{/* Search box inside dropdown */}
					<Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
						<TextField
							autoFocus
							fullWidth
							size="small"
							placeholder="Search city..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
									</InputAdornment>
								),
								sx: {
									borderRadius: 6,
									backgroundColor: "action.hover",
									"& fieldset": { border: "none" },
								},
							}}
						/>
					</Box>

					<List
						disablePadding
						sx={{
							maxHeight: 260,
							overflowY: "auto",
							"&::-webkit-scrollbar": { width: 4 },
							"&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
						}}
					>
						{loading && (
							<Box sx={{ py: 2, textAlign: "center" }}>
								<CircularProgress size={20} />
							</Box>
						)}
						{!loading && options.length === 0 && (
							<Box sx={{ py: 3, textAlign: "center" }}>
								<Typography variant="body2" color="text.secondary">
									No cities found
								</Typography>
							</Box>
						)}
						{!loading &&
							options.map((opt) => {
								const selected = opt === value;
								return (
									<ListItemButton
										key={opt}
										onClick={() => handleSelect(opt)}
										sx={{
											py: 0.75,
											px: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											borderBottom: "1px solid",
											borderColor: "divider",
											"&:last-child": { borderBottom: "none" },
										}}
									>
										<Typography
											variant="body2"
											sx={{
												flex: 1,
												fontWeight: selected ? 600 : 400,
												color: selected ? "primary.main" : "text.primary",
											}}
										>
											{opt}
										</Typography>
										<Radio checked={selected} size="small" disableRipple sx={{ p: 0.5, ml: 1 }} />
									</ListItemButton>
								);
							})}
					</List>
				</Paper>
			)}
		</Box>
	);
}
