import React from "react";
import { Box, Pagination } from "@mui/material";

interface Props {
	page: number;
	totalPages: number;
	disabled?: boolean;
	onChangePage: (page: number) => void;
}

export const PaginationBar: React.FC<Props> = ({ page, totalPages, disabled, onChangePage }) => {
	if (totalPages <= 1) return null;

	return (
		<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
			<Pagination count={totalPages} page={page} onChange={(_e, p) => onChangePage(p)} color="primary" size="large" showFirstButton showLastButton disabled={disabled} />
		</Box>
	);
};
