import { SxProps, Theme } from "@mui/material";

export const DEFAULT_ROWS_PER_PAGE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export const TABLE_CONTAINER_SX: SxProps<Theme> = {
	borderRadius: 1.5, // 12px — design card radius (--r-lg)
	border: 1,
	borderColor: "divider",
	overflowX: "auto",
};

export const HEADER_CONTAINER_SX: SxProps<Theme> = {
	position: "sticky",
	top: 0,
};

// Design `.dtable thead th`: white surface, muted 12px caption, bottom hairline.
export const HEADER_CELL_SX: SxProps<Theme> = {
	borderBottom: 1,
	borderColor: "divider",
	fontWeight: 600,
	fontSize: "0.75rem", // 12px
	letterSpacing: "0.01em",
	color: "text.secondary",
	bgcolor: "background.paper",
	whiteSpace: "nowrap",
};

export const BODY_CELL_SX: SxProps<Theme> = {
	py: 1,
	px: 2.25,
	typography: "body2", // 14px
	color: "text.primary",
	height: 56,
};

// Design tables have no zebra striping — clean bordered rows with a subtle hover.
export const ROW_STRIPE_SX: SxProps<Theme> = {
	"&:hover": { bgcolor: "action.hover" },
	minHeight: 56,
};

export const LOADING_CONTAINER_HEIGHT = 200;
