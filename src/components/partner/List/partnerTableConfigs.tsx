import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import PartnerActionsMenu from "components/partner/PartnerActionsMenu";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import BalanceCell from "components/shared/Table/cells/BalanceCell";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import PhoneCell from "components/shared/Table/cells/PhoneCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TFunction } from "i18next";
import { Partner } from "models/partner";

interface PartnerColumnHandlers {
	onEdit: (partner: Partner) => void;
	onArchive: (partner: Partner) => void;
	onRestore: (partner: Partner) => void;
	onDelete: (partner: Partner) => void;
}

/**
 * Partner list columns in the canonical order (conventions.md → Tables):
 * Партнёр · Тип · Компания · Телефон · Баланс · ⋮. The balance reads from the
 * partner's side, signed (DR-27).
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
				<EntityCell
					archived={p.isArchived}
					avatar={<EntityAvatar name={p.name} muted={p.isArchived} />}
				>
					<PartnerLink id={p.id} name={p.name} archived={p.isArchived} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("partner.table.type"),
			sortValue: (p) => t(`partner.typeShort.${p.type}`),
			renderCell: (p) => <PartnerTypeChip type={p.type} dimmed={p.isArchived} />,
		},
		{
			key: "company",
			headerName: t("partner.table.company"),
			sortValue: (p) => p.companyName ?? "",
			renderCell: (p) => <MutedTextCell text={p.companyName} />,
		},
		{
			key: "phone",
			headerName: t("partner.table.phone"),
			sortValue: (p) => p.phoneNumbers[0] ?? "",
			renderCell: (p) => <PhoneCell phone={p.phoneNumbers[0]} />,
		},
		{
			key: "balance",
			headerName: t("partner.table.balance"),
			align: "right",
			// Partner-side order: the biggest debtor (most negative on screen) first on asc.
			sortValue: (p) => -p.balance,
			renderCell: (p) => <BalanceCell balance={p.balance} main />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
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
