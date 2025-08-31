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

export const HEADER_CELL_SX: SxProps<Theme> = {
	borderBottom: 1,
	borderColor: "divider",
	fontWeight: 600,
	typography: "subtitle2",
	bgcolor: "grey.100",
};

export const BODY_CELL_SX: SxProps<Theme> = {
	py: 1,
	px: 2,
	typography: "body2",
	height: 56,
};

export const ROW_STRIPE_SX: SxProps<Theme> = {
	"&:nth-of-type(odd)": { bgcolor: "grey.50" },
	"&:hover": { bgcolor: "action.selected" },
	minHeight: 56,
};

export const LOADING_CONTAINER_HEIGHT = 200;
