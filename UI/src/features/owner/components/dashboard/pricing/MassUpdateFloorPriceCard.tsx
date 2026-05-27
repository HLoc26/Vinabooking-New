import { useState, useMemo } from "react";
import {
	Box,
	Typography,
	Button,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Alert,
	CircularProgress,
} from "@mui/material";
import { SyncRounded, WarningAmberRounded, PreviewRounded } from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";

import { syncAccommodationFloorPrices } from "../../../services/ownerPricingApi";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import useModalContext from "../../../../../context/ModalContext/hook";
import { getCardSx, getHeaderSx } from "../shared/CardSharedUI";
import type { RoomSummary } from "../../../types/owner.types";
import { formatVND } from "../../../../../utils/moneyConverter";
import NumberField from "../../../../../components/shared/NumberField";

interface Props {
	accommodationId: string;
	rooms: RoomSummary[];
}

export const MassUpdateFloorPriceCard = ({ accommodationId, rooms }: Props) => {
	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const { openModal, closeModal } = useModalContext();

	const [percent, setPercent] = useState<number>(80);
	const [minAmount, setMinAmount] = useState<number | null>(0);
	const [isPending, setIsPending] = useState(false);

	const previews = useMemo(() => {
		return rooms.map((room) => {
			const base = Number(room.basePrice);
			const calculated = Math.max(base * (percent / 100), minAmount ?? 0);
			const finalFloor = Math.min(calculated, base);
			return {
				id: room.id,
				name: room.name,
				base,
				currentFloor: Number(room.floorPrice),
				nextFloor: finalFloor,
			};
		});
	}, [rooms, percent, minAmount]);

	const executeSync = async () => {
		setIsPending(true);
		try {
			const result = await syncAccommodationFloorPrices(accommodationId, { percent, minAmount: minAmount ?? 0 });
			pushNotification(`Updated floor prices for ${result.updatedCount} rooms.`, "success");
			queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
			closeModal();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to sync floor prices";
			pushNotification(message, "error");
		} finally {
			setIsPending(false);
		}
	};

	const onConfirmSync = () => {
		openModal(
			<Box sx={{ p: 4, maxWidth: 600 }}>
				<Stack spacing={3}>
					<Box display="flex" alignItems="center" gap={2}>
						<Box
							sx={{
								width: 48,
								height: 48,
								borderRadius: 2,
								bgcolor: "error.main",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<WarningAmberRounded />
						</Box>
						<Box>
							<Typography variant="h6" fontWeight={800}>
								Apply Bulk Floor Prices?
							</Typography>
							<Typography variant="body2" color="text.secondary">
								This will overwrite the floor price for all <strong>{rooms.length}</strong> rooms.
							</Typography>
						</Box>
					</Box>

					<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell sx={{ bgcolor: "background.paper" }}>Room Name</TableCell>
									<TableCell align="right" sx={{ bgcolor: "background.paper" }}>New Floor Price</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{previews.map((p) => (
									<TableRow key={p.id}>
										<TableCell>{p.name}</TableCell>
										<TableCell align="right">
											<Typography variant="body2" fontWeight={700} color="primary.main">
												{formatVND(p.nextFloor)}
											</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>

					<Alert severity="warning" sx={{ borderRadius: 2 }}>
						This action is <strong>irreversible</strong>. Individual custom floor prices will be lost.
					</Alert>

					<Box display="flex" justifyContent="flex-end" gap={1.5}>
						<Button variant="text" color="inherit" onClick={closeModal} disabled={isPending} sx={{ fontWeight: 600 }}>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="error"
							onClick={executeSync}
							disabled={isPending}
							startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <SyncRounded />}
							sx={{ fontWeight: 700 }}
						>
							Apply to All Rooms
						</Button>
					</Box>
				</Stack>
			</Box>
		);
	};

	return (
		<Paper elevation={0} sx={{ ...getCardSx(false), border: "1px solid", borderColor: "rgba(244, 67, 54, 0.3)", bgcolor: "rgba(244, 67, 54, 0.02)" }}>
			<Box sx={getHeaderSx(false)}>
				<Box display="flex" alignItems="center" gap={1.5}>
					<Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(244, 67, 54, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
						<SyncRounded sx={{ fontSize: "1.1rem", color: "error.main" }} />
					</Box>
					<Box>
						<Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} sx={{ fontSize: "0.95rem", color: "error.main" }}>
							Bulk Floor Price Tool
						</Typography>
						<Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.75rem" }}>
							Danger Zone: Mass update minimum prices for all rooms
						</Typography>
					</Box>
				</Box>
			</Box>

			<Box sx={{ px: 3.5, py: 3 }}>
				<Stack spacing={3}>
					<Typography variant="body2" color="text.secondary">
						Set a global safety net for this accommodation. The floor price will be the <strong>higher</strong> of:
					</Typography>

					<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
						<NumberField
							label="Minimum Percentage"
							value={percent}
							onValueChange={(v) => setPercent(v ?? 0)}
							max={100}
							min={0}
							step={1}
							suffix="% of base"
						/>
						<NumberField
							label="Absolute Minimum"
							value={minAmount}
							onValueChange={setMinAmount}
							min={0}
							step={10000}
							suffix="VND"
						/>
					</Stack>

					<Box>
						<Typography variant="subtitle2" fontWeight={700} mb={1.5} display="flex" alignItems="center" gap={1}>
							<PreviewRounded fontSize="small" color="primary" /> Preview Updates
						</Typography>
						<TableContainer component={Paper} variant="outlined">
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Room</TableCell>
										<TableCell align="right">Base Price</TableCell>
										<TableCell align="right">Current Floor</TableCell>
										<TableCell align="right">New Floor</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{previews.map((p) => (
										<TableRow key={p.id}>
											<TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
											<TableCell align="right">{formatVND(p.base)}</TableCell>
											<TableCell align="right" sx={{ color: "text.secondary" }}>{formatVND(p.currentFloor)}</TableCell>
											<TableCell align="right">
												<Typography variant="body2" fontWeight={700} color={p.nextFloor !== p.currentFloor ? "primary.main" : "text.primary"}>
													{formatVND(p.nextFloor)}
												</Typography>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>

					<Box display="flex" justifyContent="flex-end">
						<Button
							variant="contained"
							color="error"
							startIcon={<SyncRounded />}
							onClick={onConfirmSync}
							sx={{ borderRadius: "10px", fontWeight: 700 }}
						>
							Apply Bulk Sync
						</Button>
					</Box>
				</Stack>
			</Box>
		</Paper>
	);
};
