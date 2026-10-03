import React from "react";
import InfoHint from "components/shared/InfoHint/InfoHint";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, ButtonBase, SxProps, Theme } from "@mui/material";

export type SortDir = "asc" | "desc";

interface DetailSortHeaderProps<K extends string> {
	col: K;
	label: string;
	active: boolean;
	dir: SortDir;
	onSort: (col: K) => void;
	align?: "left" | "right";
	/** Optional plain-language tooltip (e.g. the WAC explanation, D8) — no formula. */
	tooltip?: string;
	/** Cell styling — the detail head-cell chrome. */
	sx?: SxProps<Theme>;
}

/**
 * Sort header for the detail tables (`detailTableChrome`): a keyboard-operable
 * button inside the `th` (which carries `aria-sort`); the active column reads in
 * primary with an up/down arrow.
 */
export function DetailSortHeader<K extends string>({
	col,
	label,
	active,
	dir,
	onSort,
	align = "left",
	tooltip,
	sx,
}: DetailSortHeaderProps<K>) {
	const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : undefined;
	return (
		<Box
			component="th"
			aria-sort={ariaSort}
			className={align === "right" ? "r" : undefined}
			sx={[{ whiteSpace: "nowrap", textAlign: align }, ...(Array.isArray(sx) ? sx : [sx])]}
		>
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					flexDirection: align === "right" ? "row-reverse" : "row",
				}}
			>
				<ButtonBase
					onClick={() => onSort(col)}
					sx={{
						gap: "4px",
						font: "inherit",
						color: active ? "primary.main" : "inherit",
						borderRadius: "4px",
						"&:hover": { color: "primary.dark" },
					}}
				>
					{label}
					{active &&
						(dir === "asc" ? (
							<ArrowUpwardIcon sx={{ fontSize: 13 }} />
						) : (
							<ArrowDownwardIcon sx={{ fontSize: 13 }} />
						))}
				</ButtonBase>
				{tooltip && <InfoHint text={tooltip} />}
			</Box>
		</Box>
	);
}

export default DetailSortHeader;
