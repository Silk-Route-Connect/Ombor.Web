import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { designTokens } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, ButtonBase, Typography } from "@mui/material";

interface DetailPageHeaderProps {
	/** Parent list route the back button returns to. */
	backTo: string;
	/** The entity name — the title shows the name only (other fields live in the summary). */
	title: string;
	/** Kebab menu rows (DSN-1 ActionMenu). The page builds the status-aware set. */
	actions: ActionMenuRow[];
	isArchived?: boolean;
	/** Override the archived-badge text (defaults to the shared «Архив»). */
	archivedLabel?: string;
}

/**
 * Shared full-page detail header (locked pattern 2): a bordered back button, a
 * name-only title with the archived status badge, and a top-right bordered ⋮
 * menu. Geometry-agnostic — it slots into both the rail and the stacked detail
 * layouts without owning any page grid.
 */
export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
	backTo,
	title,
	actions,
	isArchived = false,
	archivedLabel,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: "20px",
				mb: "20px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
				<ButtonBase
					onClick={() => navigate(backTo)}
					aria-label={t("common.back")}
					sx={{
						width: 40,
						height: 40,
						flex: "0 0 auto",
						borderRadius: "8px",
						border: "1px solid",
						borderColor: designTokens.gray300,
						bgcolor: "background.paper",
						color: designTokens.gray700,
						"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
					}}
				>
					<ChevronLeftIcon sx={{ fontSize: 20 }} />
				</ButtonBase>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
					<Typography
						component="h1"
						sx={{
							fontSize: 24,
							fontWeight: 700,
							letterSpacing: "-0.02em",
							lineHeight: 1.25,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{title}
					</Typography>
					{isArchived && <ArchivedBadge label={archivedLabel} />}
				</Box>
			</Box>

			<Box sx={{ flex: "0 0 auto" }}>
				<ActionMenu actions={actions} bordered />
			</Box>
		</Box>
	);
};

export default DetailPageHeader;
