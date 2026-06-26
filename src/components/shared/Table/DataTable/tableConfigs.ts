import { SxProps, Theme } from "@mui/material";

export const DEFAULT_ROWS_PER_PAGE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export const TABLE_CONTAINER_SX: SxProps<Theme> = {
	borderRadius: 2,
	overflowX: "auto",
};

export const HEADER_CONTAINER_SX: SxProps<Theme> = {
	position: "sticky",
	top: 0,
};

// Header font kept in sync with the hand-rolled tables' `tableHeadCellSx`
// (components/shared/Table/tableStyles.ts) so every table header matches.
export const HEADER_CELL_SX: SxProps<Theme> = {
	borderBottom: 1,
	borderColor: "divider",
	fontSize: 12.5,
	fontWeight: 600,
	color: "text.secondary",
	bgcolor: "grey.100",
};

export const BODY_CELL_SX: SxProps<Theme> = {
	py: 1,
	px: 2,
	typography: "body2",
	height: 56,
};

// Clean white rows with a clear hover (no zebra) — the unified table style.
// Row dividers come from the MUI TableCell bottom border.
export const ROW_SX: SxProps<Theme> = {
	"&:hover": { bgcolor: "grey.100" },
	minHeight: 56,
};

export const LOADING_CONTAINER_HEIGHT = 200;
