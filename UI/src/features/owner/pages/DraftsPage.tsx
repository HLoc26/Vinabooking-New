import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Add, ChevronRight } from "@mui/icons-material";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { useEffect } from "react";
import { PageTitleText } from "../components/PageTitleText";
import { useOwnerDraftAccommodations } from "../hooks/useOwnerDraftAccommodations";

const getStepLabel = (step: number) => {
	switch (step) {
		case 1:
			return "Address";
		case 2:
			return "Facilities";
		case 3:
			return "Rooms";
		case 4:
			return "Images";
		case 5:
			return "Payment";
		default:
			return "Unknown";
	}
};

const TableSkeleton = () => {
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }}>
				<TableHead sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
					<TableRow>
						<TableCell sx={{ fontWeight: "bold" }}>Accommodation Name</TableCell>
						<TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
						<TableCell sx={{ fontWeight: "bold" }}>Progress</TableCell>
						<TableCell sx={{ fontWeight: "bold" }}>Next Step</TableCell>
						<TableCell align="right" sx={{ fontWeight: "bold" }}>
							Actions
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{Array.from(new Array(3)).map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton animation="wave" />
							</TableCell>
							<TableCell>
								<Skeleton animation="wave" />
							</TableCell>
							<TableCell>
								<Skeleton animation="wave" />
							</TableCell>
							<TableCell>
								<Skeleton animation="wave" />
							</TableCell>
							<TableCell align="right">
								<Skeleton animation="wave" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

const DraftsPage = () => {
	const { data, isLoading, isError } = useOwnerDraftAccommodations();
	const { pushNotification } = usePushNotificationContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (isError) {
			pushNotification("Error fetching drafts. Please try again later.", "error");
		}
	}, [isError, pushNotification]);

	const accommodations = data?.data || [];

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
				<PageTitleText>My Draft Accommodations</PageTitleText>
				<Button variant="contained" startIcon={<Add />} onClick={() => navigate("/owner/create")}>
					Create New
				</Button>
			</Box>

			{isLoading ? (
				<TableSkeleton />
			) : (
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="drafts table">
						<TableHead sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
							<TableRow>
								<TableCell sx={{ fontWeight: "bold" }}>Accommodation Name</TableCell>
								<TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
								<TableCell sx={{ fontWeight: "bold" }}>Progress</TableCell>
								<TableCell sx={{ fontWeight: "bold" }}>Next Step</TableCell>
								<TableCell align="right" sx={{ fontWeight: "bold" }}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{accommodations.length > 0 ? (
								accommodations.map((accommodation) => {
									const progressValue = ((accommodation.currentWizardStep - 1) / 5) * 100;
									return (
										<TableRow key={accommodation.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
											<TableCell component="th" scope="row">
												{accommodation.name}
											</TableCell>
											<TableCell>
												<Chip label={accommodation.status} size="small" />
											</TableCell>
											<TableCell>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<Box sx={{ width: "100%", mr: 1 }}>
														<LinearProgress variant="determinate" value={progressValue} />
													</Box>
													<Box sx={{ minWidth: 35 }}>
														<Typography variant="body2" color="text.secondary">{`${Math.round(progressValue)}%`}</Typography>
													</Box>
												</Box>
											</TableCell>
											<TableCell>{getStepLabel(accommodation.currentWizardStep)}</TableCell>
											<TableCell align="right">
												<Button
													variant="contained"
													endIcon={<ChevronRight />}
													onClick={() => {
														console.log("DraftsPage: Navigating to /owner/create/", accommodation.id);
														navigate(`/owner/create/${accommodation.id}`);
													}}
												>
													Continue
												</Button>
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={5} align="center">
										You have no draft accommodations at the moment.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
};

export default DraftsPage;
