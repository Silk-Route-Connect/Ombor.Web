import React from "react";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import WalletLink from "components/wallet/Links/WalletLink";
import { WalletActionMenu } from "components/wallet/Table/WalletActionMenu";
import {
	WALLET_TYPE_META,
	WalletTypeAvatar,
	WalletTypeBadge,
} from "components/wallet/WalletPresentation";
import { TFunction } from "i18next";
import { Wallet } from "models/wallet";

export interface WalletColumnHandlers {
	onEdit: (wallet: Wallet) => void;
	onArchive: (wallet: Wallet) => void;
	onRestore: (wallet: Wallet) => void;
	onDelete: (wallet: Wallet) => void;
}

/**
 * Wallet list columns in the canonical order (conventions.md → Tables):
 * Касса · Тип · Баланс · Авансы · Наши деньги · ⋮. «Наши деньги» is the main
 * amount; all money in ink (a wallet figure carries no direction).
 */
export function buildWalletColumns(t: TFunction, handlers: WalletColumnHandlers): Column<Wallet>[] {
	return [
		{
			key: "name",
			headerName: t("wallet.table.name"),
			sortValue: (w) => w.name,
			renderCell: (w) => (
				<EntityCell
					archived={w.isArchived}
					avatar={<WalletTypeAvatar type={w.type} archived={w.isArchived} />}
				>
					<WalletLink id={w.id} name={w.name} archived={w.isArchived} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("wallet.table.type"),
			sortValue: (w) => t(WALLET_TYPE_META[w.type].labelKey),
			renderCell: (w) => <WalletTypeBadge type={w.type} />,
		},
		{
			key: "balance",
			headerName: t("wallet.table.balance"),
			align: "right",
			sortValue: (w) => w.balance,
			renderCell: (w) => <MoneyCell value={w.balance} />,
		},
		{
			key: "advances",
			headerName: t("wallet.table.advances"),
			align: "right",
			sortValue: (w) => w.advancesHeld,
			renderCell: (w) => <MoneyCell value={w.advancesHeld} />,
		},
		{
			key: "ourMoney",
			headerName: t("wallet.table.ourMoney"),
			align: "right",
			sortValue: (w) => w.ourMoney,
			renderCell: (w) => <MoneyCell value={w.ourMoney} main />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
			renderCell: (w) => (
				<WalletActionMenu
					wallet={w}
					onEdit={() => handlers.onEdit(w)}
					onArchive={() => handlers.onArchive(w)}
					onRestore={() => handlers.onRestore(w)}
					onDelete={() => handlers.onDelete(w)}
				/>
			),
		},
	];
}
