import { useMemo, useState } from "react";
import { Box, Button, Checkbox, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton } from "@mui/material";
import { AddRounded, RemoveRounded } from "@mui/icons-material";
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

type Row = { holidayCode: string; enabled: boolean; priceMultiplier: number; preDays: number; postDays: number };

// Merge catalog with the parent-supplied opt-in list so every catalog row is
// rendered (disabled rows just have enabled=false).
const buildRows = (catalog: HolidayDto[], value: HolidayOptIn[]): Map<string, Row> => {
	const map = new Map<string, Row>();
	for (const h of catalog) {
		map.set(h.code, { holidayCode: h.code, enabled: false, priceMultiplier: 1.5, preDays: 0, postDays: 0 });
	}
	for (const c of value) {
		const existing = map.get(c.holidayCode);
		if (existing) {
			map.set(c.holidayCode, {
				...existing,
				enabled: c.enabled ?? true,
				priceMultiplier: c.priceMultiplier,
				preDays: c.preDays,
				postDays: c.postDays,
			});
		}
	}
	return map;
};

const rowsToItems = (rows: Map<string, Row>): HolidayOptIn[] =>
	Array.from(rows.values())
		.filter((r) => r.enabled)
		.map((r) => ({ 
			holidayCode: r.holidayCode, 
			priceMultiplier: r.priceMultiplier, 
			preDays: r.preDays, 
			postDays: r.postDays,
			enabled: true 
		}));

const TinySpinner = ({ 
	value, 
	onChange, 
	min, 
	max, 
	step = 1,
	disabled,
	format = (v: number) => v.toString()
}: { 
	value: number; 
	onChange: (v: number) => void; 
	min: number; 
	max?: number; 
	step?: number;
	disabled?: boolean;
	format?: (v: number) => string;
}) => (
	<Stack direction="row" alignItems="center" spacing={0.5}>
		<IconButton 
			size="small" 
			disabled={disabled || value <= min} 
			onClick={() => onChange(Number((value - step).toFixed(2)))}
			sx={{ border: "1px solid", borderColor: "divider", p: 0.25 }}
		>
			<RemoveRounded sx={{ fontSize: 14 }} />
		</IconButton>
		<Typography variant="body2" sx={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>
			{format(value)}
		</Typography>
		<IconButton 
			size="small" 
			disabled={disabled || (max !== undefined && value >= max)} 
			onClick={() => onChange(Number((value + step).toFixed(2)))}
			sx={{ border: "1px solid", borderColor: "divider", p: 0.25 }}
		>
			<AddRounded sx={{ fontSize: 14 }} />
		</IconButton>
	</Stack>
);

export const OwnerHolidayForm = ({ catalog, value, onChange, onSubmit, disabled, submitLabel = "Save holidays", hideSubmit }: Props) => {
	const rows = useMemo(() => buildRows(catalog, value), [catalog, value]);
	const [error, setError] = useState<string | null>(null);

	const formatDate = (dateStr: string, isRecurring: boolean) => {
		const date = new Date(dateStr);
		if (isRecurring) {
			return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
		}
		return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
	};

	const emit = (next: Map<string, Row>) => {
		onChange?.(rowsToItems(next));
	};

	const updateRow = (holidayCode: string, patch: Partial<Row>) => {
		const existing = rows.get(holidayCode) ?? { holidayCode, enabled: false, priceMultiplier: 1.5, preDays: 0, postDays: 0 };
		const next = new Map(rows);
		next.set(holidayCode, { ...existing, ...patch });
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
							<TableCell>Holiday (Anchor)</TableCell>
							<TableCell>Anchor Date</TableCell>
							<TableCell>Multiplier</TableCell>
							<TableCell>Days Before</TableCell>
							<TableCell>Days After</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{catalog.map((h) => {
							const r = rows.get(h.code) ?? { holidayCode: h.code, enabled: false, priceMultiplier: 1.5, preDays: 0, postDays: 0 };
							return (
								<TableRow key={h.code} sx={{ height: 60 }}>
									<TableCell>
										<Checkbox
											checked={r.enabled}
											disabled={disabled}
											onChange={(e) => updateRow(h.code, { enabled: e.target.checked })}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" fontWeight={600}>{h.name}</Typography>
										{h.isRecurring && <Typography variant="caption" color="text.secondary">Recurring</Typography>}
									</TableCell>
									<TableCell>
										<Typography variant="body2">{formatDate(h.date, h.isRecurring)}</Typography>
									</TableCell>
									<TableCell>
										<TinySpinner 
											value={r.priceMultiplier} 
											onChange={(v) => updateRow(h.code, { priceMultiplier: v })}
											min={1} max={5} step={0.1}
											disabled={disabled || !r.enabled}
											format={(v) => v.toFixed(1) + "x"}
										/>
									</TableCell>
									<TableCell>
										<TinySpinner 
											value={r.preDays} 
											onChange={(v) => updateRow(h.code, { preDays: v })}
											min={0} max={30}
											disabled={disabled || !r.enabled}
										/>
									</TableCell>
									<TableCell>
										<TinySpinner 
											value={r.postDays} 
											onChange={(v) => updateRow(h.code, { postDays: v })}
											min={0} max={30}
											disabled={disabled || !r.enabled}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			{error && <Typography color="error" variant="caption">{error}</Typography>}
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

