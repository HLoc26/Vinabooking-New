import { useState, useRef, useEffect } from "react";
import { Box, TextField, Paper, List, ListItemButton, Radio, Typography, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export interface CountryOption {
	name: string; // e.g. "Vietnam"
	code: string; // ISO alpha-2 e.g. "VN"
	flag: string; // emoji flag e.g. "🇻🇳"
}

// Module-level cache so we only fetch once per app session
let cachedCountries: CountryOption[] | null = null;

async function loadCountries(): Promise<CountryOption[]> {
	if (cachedCountries) return cachedCountries;

	const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flag", { headers: { Accept: "application/json" } });
	if (!res.ok) throw new Error(`RestCountries ${res.status}`);

	const data: Array<{ name: { common: string }; cca2: string; flag: string }> = await res.json();

	cachedCountries = data
		.map((c) => ({
			name: c.name.common,
			code: c.cca2,
			flag: c.flag ?? "",
		}))
		.sort((a, b) => a.name.localeCompare(b.name));

	return cachedCountries;
}

interface Props {
	label?: string;
	value: string; // country name
	onChange: (name: string, code: string) => void;
	placeholder?: string;
}

export default function CountryComboBox({ label = "Country / Region", value, onChange, placeholder = "Select country..." }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [countries, setCountries] = useState<CountryOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Load once on first open
	const ensureLoaded = async () => {
		if (countries.length > 0 || loading) return;
		setLoading(true);
		setError(false);
		try {
			const list = await loadCountries();
			setCountries(list);
		} catch {
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	const handleOpen = async () => {
		setOpen((p) => !p);
		await ensureLoaded();
	};

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
				setQuery("");
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const filtered = query ? countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())) : countries;

	const handleSelect = (c: CountryOption) => {
		onChange(c.name, c.code);
		setOpen(false);
		setQuery("");
	};

	return (
		<Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
			<TextField
				fullWidth
				label={label}
				value={value}
				placeholder={placeholder}
				onClick={handleOpen}
				onChange={(e) => {
					// Allow typing to filter
					onChange(e.target.value, "");
					setQuery(e.target.value);
					if (!open) {
						setOpen(true);
						ensureLoaded();
					}
				}}
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							{loading && !open ? (
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
										color: "text.secondary",
										fontSize: 20,
										cursor: "pointer",
									}}
								/>
							)}
						</InputAdornment>
					),
				}}
			/>

			{open && (
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
					{/* Search box */}
					<Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
						<TextField
							autoFocus
							fullWidth
							size="small"
							placeholder="Search country..."
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
							maxHeight: 280,
							overflowY: "auto",
							"&::-webkit-scrollbar": { width: 4 },
							"&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
						}}
					>
						{loading && (
							<Box sx={{ py: 3, textAlign: "center" }}>
								<CircularProgress size={22} />
								<Typography variant="caption" display="block" mt={1} color="text.secondary">
									Loading countries...
								</Typography>
							</Box>
						)}

						{!loading && error && (
							<Box sx={{ py: 3, textAlign: "center" }}>
								<Typography variant="body2" color="error">
									Failed to load countries. Check your connection.
								</Typography>
							</Box>
						)}

						{!loading && !error && filtered.length === 0 && (
							<Box sx={{ py: 3, textAlign: "center" }}>
								<Typography variant="body2" color="text.secondary">
									No results
								</Typography>
							</Box>
						)}

						{!loading &&
							!error &&
							filtered.map((c) => {
								const selected = c.name === value;
								return (
									<ListItemButton
										key={c.code}
										onClick={() => handleSelect(c)}
										sx={{
											py: 0.75,
											px: 2,
											display: "flex",
											alignItems: "center",
											gap: 1.5,
											borderBottom: "1px solid",
											borderColor: "divider",
											"&:last-child": { borderBottom: "none" },
										}}
									>
										<Typography fontSize="1.2rem" lineHeight={1}>
											{c.flag}
										</Typography>
										<Typography
											variant="body2"
											sx={{
												flex: 1,
												fontWeight: selected ? 600 : 400,
												color: selected ? "primary.main" : "text.primary",
											}}
										>
											{c.name}
										</Typography>
										<Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>
											{c.code}
										</Typography>
										<Radio checked={selected} size="small" disableRipple sx={{ p: 0.5 }} />
									</ListItemButton>
								);
							})}
					</List>
				</Paper>
			)}
		</Box>
	);
}
