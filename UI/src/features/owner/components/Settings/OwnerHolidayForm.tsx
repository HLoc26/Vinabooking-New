import { useEffect, useState } from "react";
import { Box, Button, Checkbox, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import type { HolidayDto, HolidayOptIn, OwnerHolidayRow } from "../../types/pricing.types";

interface Props {
	catalog: HolidayDto[];
	current: OwnerHolidayRow[];
	disabled?: boolean;
	onSubmit: (items: HolidayOptIn[]) => void | Promise<void>;
	submitLabel?: string;
	hideSubmit?: boolean;
}

type Row = { holidayId: number; enabled: boolean; priceMultiplier: number };

const buildRows = (catalog: HolidayDto[], current: OwnerHolidayRow[]): Map<number, Row> => {
	const map = new Map<number, Row>();
	for (const h of catalog) {
		map.set(h.id, { holidayId: h.id, enabled: false, priceMultiplier: 1.5 });
	}
	for (const c of current) {
		map.set(c.holidayId, { holidayId: c.holidayId, enabled: c.enabled, priceMultiplier: c.priceMultiplier });
	}
	return map;
};

export const OwnerHolidayForm = ({ catalog, current, disabled, onSubmit, submitLabel = "Save holidays", hideSubmit }: Props) => {
	const [rows, setRows] = useState<Map<number, Row>>(() => buildRows(catalog, current));
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setRows(buildRows(catalog, current));
	}, [catalog, current]);

	const updateRow = (holidayId: number, patch: Partial<Row>) => {
		setRows((prev) => {
			const next = new Map(prev);
			const existing = next.get(holidayId) ?? { holidayId, enabled: false, priceMultiplier: 1.5 };
			next.set(holidayId, { ...existing, ...patch });
			return next;
		});
	};

	const submit = async () => {
		setError(null);
		const items: HolidayOptIn[] = Array.from(rows.values())
			.filter((r) => r.enabled)
			.map((r) => ({ holidayId: r.holidayId, priceMultiplier: r.priceMultiplier, enabled: true }));
		for (const item of items) {
			if (item.priceMultiplier < 1 || item.priceMultiplier > 5) {
				setError("Each multiplier must be between 1.0 and 5.0");
				return;
			}
		}
		await onSubmit(items);
	};

	return (
		<Stack spacing={2}>
			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell width={48}>Opt in</TableCell>
							<TableCell>Holiday</TableCell>
							<TableCell>Date</TableCell>
							<TableCell>Recurring</TableCell>
							<TableCell width={180}>Price multiplier (×)</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{catalog.map((h) => {
							const r = rows.get(h.id) ?? { holidayId: h.id, enabled: false, priceMultiplier: 1.5 };
							return (
								<TableRow key={h.id}>
									<TableCell>
										<Checkbox
											checked={r.enabled}
											disabled={disabled}
											onChange={(e) => updateRow(h.id, { enabled: e.target.checked })}
										/>
									</TableCell>
									<TableCell>{h.name}</TableCell>
									<TableCell>{h.isRecurring ? h.date.slice(5) : h.date.slice(0, 10)}</TableCell>
									<TableCell>{h.isRecurring ? "Yes" : "No"}</TableCell>
									<TableCell>
										<TextField
											type="number"
											size="small"
											value={r.priceMultiplier}
											disabled={disabled || !r.enabled}
											inputProps={{ min: 1, max: 5, step: 0.1 }}
											onChange={(e) => updateRow(h.id, { priceMultiplier: Number(e.target.value) })}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			{error && <Typography color="error">{error}</Typography>}
			{!hideSubmit && (
				<Box display="flex" justifyContent="flex-end">
					<Button variant="contained" onClick={submit} disabled={disabled}>
						{submitLabel}
					</Button>
				</Box>
			)}
		</Stack>
	);
};

export default OwnerHolidayForm;
