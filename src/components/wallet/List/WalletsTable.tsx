import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState, { archiveListEmptyKind } from "components/shared/Table/TableEmptyState";
import { Loadable } from "helpers/Loading";
import { Wallet } from "models/wallet";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import { buildWalletColumns, WalletColumnHandlers } from "./walletTableConfigs";

interface WalletsTableProps extends WalletColumnHandlers {
	rows: Loadable<Wallet[]>;
	showArchived: boolean;
	isFiltering: boolean;
	/** Whether any wallet exists at all (drives the empty-state copy). */
	hasAny: boolean;
	/** Whether any active (non-archived) wallet exists. */
	hasActive: boolean;
	onOpen: (wallet: Wallet) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить кассы». */
	errorTitle: string;
}

/**
 * Wallet list on the shared DataTable, each row opening the full-page detail.
 * Totals live in the summary strip above (rule 31), so there is no totals row.
 */
export const WalletsTable: React.FC<WalletsTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	showArchived,
	isFiltering,
	hasAny,
	hasActive,
	onOpen,
	onCreate,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildWalletColumns(t, { onEdit, onArchive, onRestore, onDelete }),
		[t, onEdit, onArchive, onRestore, onDelete],
	);
	const kind = archiveListEmptyKind({ isFiltering, hasAny, hasActive, showArchived });
	const copy = {
		filtering: { title: t("wallet.empty.searchTitle"), hint: t("wallet.empty.searchBody") },
		empty: { title: t("wallet.empty.title"), hint: t("wallet.empty.body") },
		allArchived: {
			title: t("wallet.empty.allArchivedTitle"),
			hint: t("wallet.empty.allArchivedBody"),
		},
	}[kind];

	return (
		<DataTable<Wallet>
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
			empty={
				<TableEmptyState
					icon={<AccountBalanceWalletOutlinedIcon />}
					title={copy.title}
					hint={copy.hint}
					action={kind === "empty" ? { label: t("wallet.create"), onClick: onCreate } : undefined}
				/>
			}
		/>
	);
};

export default WalletsTable;
