import { useMemo, useState } from "react";
import { Box, Button, Checkbox, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import type { HolidayDto, HolidayOptIn } from "../../types/pricing.types";

interface Props {
	catalog: HolidayDto[];
	value: HolidayOptIn[];
	onChange?: (items: HolidayOptIn[]) => void;
	onSubmit?: (items: HolidayOptIn[]) => void | Promise<void>;
	disabled?: boolean;
	submitLabel?: string;
	hideSubmit?: boolean;
}

type Row = { holidayId: number; enabled: boolean; priceMultiplier: number };

// Merge catalog with the parent-supplied opt-in list so every catalog row is
// rendered (disabled rows just have enabled=false).
const buildRows = (catalog: HolidayDto[], value: HolidayOptIn[]): Map<number, Row> => {
	const map = new Map<number, Row>();
	for (const h of catalog) {
		map.set(h.id, { holidayId: h.id, enabled: false, priceMultiplier: 1.5 });
	}
	for (const c of value) {
		map.set(c.holidayId, {
			holidayId: c.holidayId,
			enabled: c.enabled ?? true,
			priceMultiplier: c.priceMultiplier,
		});
	}
	return map;
};

const rowsToItems = (rows: Map<number, Row>): HolidayOptIn[] =>
	Array.from(rows.values())
		.filter((r) => r.enabled)
		.map((r) => ({ holidayId: r.holidayId, priceMultiplier: r.priceMultiplier, enabled: true }));

export const OwnerHolidayForm = ({ catalog, value, onChange, onSubmit, disabled, submitLabel = "Save holidays", hideSubmit }: Props) => {
	const rows = useMemo(() => buildRows(catalog, value), [catalog, value]);
	const [error, setError] = useState<string | null>(null);

	const emit = (next: Map<number, Row>) => {
		onChange?.(rowsToItems(next));
	};

	const updateRow = (holidayId: number, patch: Partial<Row>) => {
		const existing = rows.get(holidayId) ?? { holidayId, enabled: false, priceMultiplier: 1.5 };
		const next = new Map(rows);
		next.set(holidayId, { ...existing, ...patch });
		emit(next);
	};

	const submit = async () => {
		if (!onSubmit) return;
		setError(null);
		const items = rowsToItems(rows);
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
			{!hideSubmit && onSubmit && (
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
