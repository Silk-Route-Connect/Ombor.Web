import React from "react";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Tooltip } from "@mui/material";

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
}

/**
 * Clickable sort header for the bespoke detail tables (`detailTableChrome`) that
 * can't use the shared DataTable's TableSortLabel — they carry a totals row or a
 * ledger layout. Renders the active column in primary with an up/down arrow;
 * shared by the warehouse Остатки / Движения tabs so the sort affordance is
 * identical across detail tables.
 */
export function DetailSortHeader<K extends string>({
	col,
	label,
	active,
	dir,
	onSort,
	align = "left",
	tooltip,
}: DetailSortHeaderProps<K>) {
	return (
		<Box
			component="th"
			className={align === "right" ? "r" : undefined}
			onClick={() => onSort(col)}
			sx={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
		>
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					color: active ? "primary.main" : "inherit",
				}}
			>
				{label}
				{tooltip && (
					<Tooltip title={tooltip} placement="top" arrow>
						<InfoOutlinedIcon
							onClick={(e) => e.stopPropagation()}
							sx={{ fontSize: 14, color: "text.disabled", cursor: "help" }}
						/>
					</Tooltip>
				)}
				{active &&
					(dir === "asc" ? (
						<ArrowUpwardIcon sx={{ fontSize: 13 }} />
					) : (
						<ArrowDownwardIcon sx={{ fontSize: 13 }} />
					))}
			</Box>
		</Box>
	);
}

export default DetailSortHeader;
