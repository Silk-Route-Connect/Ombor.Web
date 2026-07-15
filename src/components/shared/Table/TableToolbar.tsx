import React from "react";
import { SearchInput } from "components/shared/SearchInput/SearchInput";

import { Box, SxProps, Theme } from "@mui/material";

export interface TableToolbarProps {
	/** Leftmost search box (optional). `dense` narrows it for in-card bands. */
	search?: {
		value: string;
		onChange: (value: string) => void;
		placeholder: string;
		dense?: boolean;
	};
	/** Filter controls (segmented, dropdowns) rendered after the search. */
	filters?: React.ReactNode;
	/** Right-aligned actions (export, …), pushed to the far end by a spacer. */
	actions?: React.ReactNode;
	sx?: SxProps<Theme>;
}

/**
 * Shared table toolbar band (XC-15): one flex row carrying the search box, the
 * filter controls and right-aligned actions — the single home for a table's
 * search / filters / export, so they sit with the table instead of scattered
 * across the page header and separate filter rows. Wraps on narrow widths.
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({ search, filters, actions, sx }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			flexWrap: "wrap",
			mb: "14px",
			...sx,
		}}
	>
		{search && (
			<SearchInput
				value={search.value}
				onChange={search.onChange}
				placeholder={search.placeholder}
				dense={search.dense}
			/>
		)}
		{filters}
		{actions && (
			<>
				<Box sx={{ flexGrow: 1 }} />
				{actions}
			</>
		)}
	</Box>
);

export default TableToolbar;
