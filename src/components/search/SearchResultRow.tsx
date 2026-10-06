import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { isPlainClick } from "components/shared/Link/DetailLink";
import UzsUnit from "components/shared/Money/UzsUnit";
import { designTokens, numericSx, radius } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { searchHitSecondary, SearchOption } from "utils/globalSearch";

import { Box, ListItemButton, Typography } from "@mui/material";

import { SEARCH_GROUP_ICONS, searchOptionDomId } from "./searchGroupMeta";

interface SearchResultRowProps {
	option: SearchOption;
	active: boolean;
	onHover: () => void;
	/** A plain click opened the record in place — the palette closes. */
	onOpened: () => void;
}

/**
 * One result: the group glyph, the name (a document's «№»), a muted second
 * line, the «Архив» badge, and for a document its amount and date. A real
 * link, so Ctrl / middle click opens the record in a new tab.
 */
const SearchResultRow: React.FC<SearchResultRowProps> = ({ option, active, onHover, onOpened }) => {
	const { t } = useTranslation();
	const { hit, group } = option;
	const Icon = SEARCH_GROUP_ICONS[group];
	const isDocument = group === "documents";
	const secondary = searchHitSecondary(t, group, hit);

	return (
		<ListItemButton
			component={RouterLink}
			to={option.path}
			id={searchOptionDomId(option.key)}
			role="option"
			aria-selected={active}
			selected={active}
			tabIndex={-1}
			onMouseMove={active ? undefined : onHover}
			onClick={(e: React.MouseEvent) => {
				if (isPlainClick(e)) {
					onOpened();
				}
			}}
			sx={{
				gap: "12px",
				mx: 1,
				px: 1.25,
				py: "7px",
				borderRadius: `${radius.md}px`,
				"&.Mui-selected, &.Mui-selected:hover": { bgcolor: designTokens.primarySoft },
			}}
		>
			<Box
				sx={{
					display: "grid",
					placeItems: "center",
					width: 32,
					height: 32,
					flex: "0 0 auto",
					borderRadius: `${radius.md}px`,
					bgcolor: active ? "background.paper" : designTokens.gray25,
					color: active ? "primary.main" : "text.secondary",
				}}
			>
				<Icon sx={{ fontSize: 18 }} />
			</Box>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
					<Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
						{isDocument ? formatEntityId(hit.label) : hit.label}
					</Typography>
					{hit.isArchived && <ArchivedBadge />}
				</Box>
				{secondary && (
					<Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
						{secondary}
					</Typography>
				)}
			</Box>
			{isDocument && (
				<Box sx={{ flex: "0 0 auto", textAlign: "right" }}>
					{hit.amount != null && (
						<Typography sx={{ ...numericSx, fontSize: 13, fontWeight: 600 }}>
							{formatCurrency(hit.amount)}
							<UzsUnit />
						</Typography>
					)}
					{hit.date && (
						<Typography sx={{ ...numericSx, fontSize: 12, color: "text.secondary" }}>
							{formatDate(hit.date)}
						</Typography>
					)}
				</Box>
			)}
		</ListItemButton>
	);
};

export default SearchResultRow;
