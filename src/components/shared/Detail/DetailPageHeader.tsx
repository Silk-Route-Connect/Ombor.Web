import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { designTokens } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, ButtonBase, Typography } from "@mui/material";

interface DetailPageHeaderProps {
	/** Fallback list route for the back button — used only on a direct load / deep
	 *  link (no in-app history); otherwise back returns to the previous page. */
	backTo: string;
	/** The entity name — the title shows the name only (other fields live in the summary). */
	title: string;
	/** Kebab menu rows (DSN-1 ActionMenu). The page builds the status-aware set;
	 *  omit / pass an empty array for an action-less detail (e.g. immutable records). */
	actions?: ActionMenuRow[];
	/** Inline badges after the title (same slot the archived badge uses) — e.g. the
	 *  order's status + source chips. Keep to small chip-height (≤24px) elements. */
	titleExtra?: React.ReactNode;
	/** Secondary meta line under the title row (e.g. «Создан 12.06.2026 · Клиент»). */
	meta?: React.ReactNode;
	/** Optional standalone action node rendered left of the kebab. Reserved for
	 *  child-event creation (locked pattern 2) — e.g. the warehouse «Начальный
	 *  остаток» button; entity lifecycle actions stay in the {@link actions} kebab. */
	primaryAction?: React.ReactNode;
	isArchived?: boolean;
	/** Override the archived-badge text (defaults to the shared «Архив»). */
	archivedLabel?: string;
}

/**
 * Shared full-page detail header (locked pattern 2): a bordered back button, a
 * name-only title with the archived status badge, and a top-right bordered ⋮
 * menu. Geometry-agnostic — it slots into both the rail and the stacked detail
 * layouts without owning any page grid. An optional `primaryAction` node renders
 * left of the kebab for a child-event create button (e.g. warehouse «Начальный
 * остаток»); lifecycle actions stay in the `actions` kebab.
 */
export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
	backTo,
	title,
	actions,
	primaryAction,
	titleExtra,
	meta,
	isArchived = false,
	archivedLabel,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	// Back returns to the previous page; on a direct load / deep link (no in-app
	// history, so `key` is the router default) it falls back to the list route.
	const goBack = () => (location.key === "default" ? navigate(backTo) : navigate(-1));

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
					onClick={goBack}
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

				<Box sx={{ minWidth: 0 }}>
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
						{titleExtra}
					</Box>
					{meta && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								mt: "6px",
								fontSize: 13.5,
								color: "text.secondary",
							}}
						>
							{meta}
						</Box>
					)}
				</Box>
			</Box>

			{(primaryAction || (actions && actions.length > 0)) && (
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
					{primaryAction}
					{actions && actions.length > 0 && <ActionMenu actions={actions} bordered />}
				</Box>
			)}
		</Box>
	);
};

export default DetailPageHeader;
