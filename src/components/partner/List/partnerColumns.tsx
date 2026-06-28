import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import PartnerActionsMenu from "components/partner/PartnerActionsMenu";
import PartnerAvatar from "components/partner/PartnerAvatar";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Partner } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { balanceColor } from "utils/partnerUtils";

import { Box, Typography } from "@mui/material";

interface PartnerColumnHandlers {
	onEdit: (partner: Partner) => void;
	onArchive: (partner: Partner) => void;
	onRestore: (partner: Partner) => void;
	onDelete: (partner: Partner) => void;
}

const ArchivedBadge: React.FC<{ label: string }> = ({ label }) => (
	<Box
		component="span"
		sx={{
			fontSize: 10.5,
			fontWeight: 600,
			letterSpacing: "0.02em",
			textTransform: "uppercase",
			color: designTokens.gray500,
			bgcolor: designTokens.gray100,
			border: "1px solid",
			borderColor: designTokens.gray200,
			px: "7px",
			py: "1px",
			borderRadius: "999px",
			whiteSpace: "nowrap",
		}}
	>
		{label}
	</Box>
);

const Muted: React.FC = () => (
	<Box component="span" sx={{ color: "text.secondary" }}>
		—
	</Box>
);

/**
 * Partner list columns (canonical order — locked pattern): entity → type chip →
 * descriptive → money (right, tabular, last before ⋮). Every non-free-text
 * column is sortable; phone is free-text and opts out. The name is a
 * {@link PartnerLink} (the row is also clickable; the link stops propagation).
 */
export function buildPartnerColumns(
	t: TFunction,
	handlers: PartnerColumnHandlers,
): Column<Partner>[] {
	return [
		{
			key: "name",
			headerName: t("partner.table.name"),
			sortValue: (p) => p.name,
			renderCell: (p) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
					<PartnerAvatar name={p.name} size={36} dimmed={p.isArchived} />
					<Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
						<Box
							component="span"
							onClick={(e) => e.stopPropagation()}
							sx={{
								fontWeight: 600,
								"& a": p.isArchived
									? { color: "text.secondary", textDecorationLine: "line-through" }
									: undefined,
							}}
						>
							<PartnerLink id={p.id} name={p.name} />
						</Box>
						{p.isArchived && <ArchivedBadge label={t("partner.badge.archived")} />}
					</Box>
				</Box>
			),
		},
		{
			key: "type",
			headerName: t("partner.table.type"),
			sortValue: (p) => p.type,
			renderCell: (p) => <PartnerTypeChip type={p.type} dimmed={p.isArchived} />,
		},
		{
			key: "company",
			headerName: t("partner.table.company"),
			sortValue: (p) => p.companyName ?? "",
			renderCell: (p) =>
				p.companyName ? (
					<Box component="span" sx={{ opacity: p.isArchived ? 0.6 : 1 }}>
						{p.companyName}
					</Box>
				) : (
					<Muted />
				),
		},
		{
			key: "phone",
			headerName: t("partner.table.phone"),
			sortable: false,
			renderCell: (p) =>
				p.phoneNumbers.length > 0 ? (
					<Box
						component="span"
						sx={{
							...numericSx,
							color: designTokens.gray700,
							whiteSpace: "nowrap",
							opacity: p.isArchived ? 0.6 : 1,
						}}
					>
						{p.phoneNumbers[0]}
					</Box>
				) : (
					<Muted />
				),
		},
		{
			key: "balance",
			headerName: t("partner.table.balance"),
			align: "right",
			sortValue: (p) => p.balance,
			renderCell: (p) =>
				!Number.isFinite(p.balance) || p.balance === 0 ? (
					<Muted />
				) : (
					<Typography
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							fontSize: 15,
							letterSpacing: "-0.01em",
							color: balanceColor(p.balance),
							opacity: p.isArchived ? 0.6 : 1,
						}}
					>
						{formatCurrency(Math.abs(p.balance))}
					</Typography>
				),
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: 56,
			renderCell: (p) => (
				<PartnerActionsMenu
					partner={p}
					onEdit={() => handlers.onEdit(p)}
					onArchive={() => handlers.onArchive(p)}
					onRestore={() => handlers.onRestore(p)}
					onDelete={() => handlers.onDelete(p)}
				/>
			),
		},
	];
}
