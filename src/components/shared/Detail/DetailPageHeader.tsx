import React from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { designTokens } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Link, Typography } from "@mui/material";

export interface DetailBreadcrumb {
	/** Parent list label, e.g. «Товары». */
	label: string;
	/** Parent list route — drives both the breadcrumb link and the back button. */
	to: string;
}

interface DetailPageHeaderProps {
	breadcrumb: DetailBreadcrumb;
	/** The entity name — the title shows the name only (other fields live in the summary). */
	title: string;
	/** Kebab menu rows (DSN-1 ActionMenu). The page builds the status-aware set. */
	actions: ActionMenuRow[];
	isArchived?: boolean;
	/** Override the archived-badge text (defaults to the shared «Архив»). */
	archivedLabel?: string;
}

/**
 * Shared full-page detail header (locked pattern 2): «parent › name» breadcrumb,
 * a bordered back button, a name-only title with the archived status badge, and a
 * top-right bordered ⋮ menu. Geometry-agnostic — it slots into both the rail and
 * the stacked detail layouts without owning any page grid.
 */
export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
	breadcrumb,
	title,
	actions,
	isArchived = false,
	archivedLabel,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<>
			{/* breadcrumb */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					mb: "16px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Link
					component={RouterLink}
					to={breadcrumb.to}
					underline="hover"
					sx={{ color: "text.secondary", fontSize: 13 }}
				>
					{breadcrumb.label}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{title}
				</Typography>
			</Box>

			{/* header row */}
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
						onClick={() => navigate(breadcrumb.to)}
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
		</>
	);
};

export default DetailPageHeader;
