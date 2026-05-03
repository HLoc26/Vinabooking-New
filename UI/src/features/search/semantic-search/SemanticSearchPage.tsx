import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, TextField, Button, Paper, Autocomplete, CircularProgress, Container, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SemanticSearchParams } from "./types";
import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopMount";

interface NominatimResult {
	place_id: number;
	display_name: string;
	lat: string;
	lon: string;
	type: string;
	class: string;
	address: {
		city?: string;
		town?: string;
		municipality?: string;
		country?: string;
	};
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();
	useEffect(() => {
		map.setView([lat, lng], 13, { animate: true });
	}, [lat, lng, map]);
	return null;
}

export const SemanticSearchPage: React.FC = () => {
	const navigate = useNavigate();
	useScrollToTopOnMount();

	const [query, setQuery] = useState("");
	const [cityOptions, setCityOptions] = useState<NominatimResult[]>([]);
	const [selectedCity, setSelectedCity] = useState<NominatimResult | null>(null);
	const [cityInput, setCityInput] = useState("");
	const [loadingCities, setLoadingCities] = useState(false);

	const [mapCenter, setMapCenter] = useState<[number, number]>([14.0583, 108.2772]); // Default Vietnam
	const [mapZoom, setMapZoom] = useState(5);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const searchCities = useCallback((input: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (input.length < 2) {
			setCityOptions([]);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setLoadingCities(true);
			try {
				const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5&featuretype=city`, {
					headers: { "Accept-Language": "en" },
				});
				const data: NominatimResult[] = await res.json();
				// Filter to only include locations likely to be cities/towns
				const filtered = data.filter((d) => ["city", "town", "municipality", "administrative", "village"].includes(d.type));
				setCityOptions(filtered);
			} catch (error) {
				console.error("Failed to fetch cities:", error);
				setCityOptions([]);
			} finally {
				setLoadingCities(false);
			}
		}, 400);
	}, []);

	useEffect(() => {
		searchCities(cityInput);
	}, [cityInput, searchCities]);

	const handleCitySelect = (city: NominatimResult | null) => {
		setSelectedCity(city);
		if (city) {
			const lat = parseFloat(city.lat);
			const lng = parseFloat(city.lon);
			setMapCenter([lat, lng]);
			setMapZoom(12);
		}
	};

	const canSearch = query.trim().length >= 5 && selectedCity !== null;

	const handleSearch = () => {
		if (!canSearch || !selectedCity) return;
		const params: SemanticSearchParams = {
			query,
			city: selectedCity.address.city || selectedCity.address.town || selectedCity.address.municipality || selectedCity.display_name.split(",")[0],
			lat: parseFloat(selectedCity.lat),
			lng: parseFloat(selectedCity.lon),
		};
		navigate("/search/semantic/loading", { state: { params } });
	};

	const charCount = query.length;

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: 4, pb: 8 }}>
			<Container maxWidth="lg">
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4, color: "text.secondary", textTransform: "none", fontWeight: 600 }}>
					Back
				</Button>

				<Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center" mb={2}>
					Describe Your Perfect Stay
				</Typography>
				<Typography variant="body1" color="text.secondary" textAlign="center" mb={6} maxWidth={600} mx="auto">
					Our AI understands natural language. Tell us exactly what you're looking for, and we'll find the best matching accommodations.
				</Typography>

				<Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
					<Grid container spacing={4}>
						{/* Left Column: Form Elements */}
						<Grid size={{ xs: 12, md: 5 }}>
							<Box display="flex" flexDirection="column" gap={4} height="100%">
								<Box>
									<Box display="flex" justifyContent="space-between" mb={1}>
										<Typography variant="subtitle1" fontWeight={700}>
											What are you looking for?
										</Typography>
										<Typography variant="caption" color={charCount > 100 ? "error" : "text.secondary"}>
											{charCount}/100
										</Typography>
									</Box>
									<TextField
										fullWidth
										multiline
										minRows={4}
										maxRows={6}
										placeholder="e.g. Quiet boutique hotel with a rooftop pool, close to the historic centre, great breakfast included..."
										value={query}
										onChange={(e) => setQuery(e.target.value.slice(0, 100))}
										error={charCount > 100}
									/>
								</Box>

								<Box>
									<Typography variant="subtitle1" fontWeight={700} mb={1}>
										Destination City
									</Typography>
									<Autocomplete
										options={cityOptions}
										getOptionLabel={(opt) => opt.display_name}
										filterOptions={(x) => x}
										value={selectedCity}
										inputValue={cityInput}
										onInputChange={(_, val) => setCityInput(val)}
										onChange={(_, val) => handleCitySelect(val)}
										loading={loadingCities}
										noOptionsText={cityInput.length < 2 ? "Type to search..." : "No cities found"}
										renderOption={(props, option) => {
											const city = option.address.city || option.address.town || option.address.municipality || option.display_name.split(",")[0];
											const country = option.address.country || "";
											return (
												<Box component="li" {...props} key={option.place_id}>
													<LocationOnIcon sx={{ mr: 2, color: "text.secondary" }} />
													<Box>
														<Typography variant="body1" fontWeight={500}>
															{city}
														</Typography>
														<Typography variant="body2" color="text.secondary">
															{country}
														</Typography>
													</Box>
												</Box>
											);
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Search a city..."
												InputProps={{
													...params.InputProps,
													endAdornment: (
														<>
															{loadingCities ? <CircularProgress color="inherit" size={20} /> : null}
															{params.InputProps.endAdornment}
														</>
													),
												}}
											/>
										)}
									/>
								</Box>

								<Box flexGrow={1} />

								<Button
									fullWidth
									variant="contained"
									color="primary"
									size="large"
									startIcon={<SearchIcon />}
									disabled={!canSearch}
									onClick={handleSearch}
									sx={{ py: 2, fontSize: "1.1rem", borderRadius: 3, fontWeight: 700 }}
								>
									Search Accommodations
								</Button>
							</Box>
						</Grid>

						{/* Right Column: Map Component */}
						<Grid size={{ xs: 12, md: 7 }}>
							<Box sx={{ height: "100%", minHeight: { xs: 300, md: 450 }, borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
								<MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%", zIndex: 0 }} zoomControl={true}>
									<TileLayer
										url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
										attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
									/>
									{selectedCity && (
										<>
											<MapRecenter lat={parseFloat(selectedCity.lat)} lng={parseFloat(selectedCity.lon)} />
											<Marker position={[parseFloat(selectedCity.lat), parseFloat(selectedCity.lon)]} />
										</>
									)}
								</MapContainer>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</Container>
		</Box>
	);
};
