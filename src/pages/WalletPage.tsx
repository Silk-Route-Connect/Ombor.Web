import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import WalletFormModal from "components/wallet/Form/WalletFormModal";
import WalletHeader from "components/wallet/Header/WalletHeader";
import WalletsTable from "components/wallet/List/WalletsTable";
import WalletSummaryStrip from "components/wallet/List/WalletSummaryStrip";
import WalletDialogs from "components/wallet/WalletDialogs";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { CreateWalletRequest, Wallet } from "models/wallet";
import { walletDetailPath } from "routing/paths";
import { WalletFormValues } from "schemas/WalletSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import { Box } from "@mui/material";

const WalletPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { walletStore } = useStore();

	useEffect(() => {
		walletStore.getAll();
	}, [walletStore]);

	const dialogMode = walletStore.dialogMode;
	const editingWallet = dialogMode.kind === "form" ? (dialogMode.wallet ?? null) : null;

	const handleFormSave = (payload: WalletFormValues): void => {
		if (editingWallet) {
			walletStore.update({ id: editingWallet.id, name: payload.name });
		} else {
			const request: CreateWalletRequest = {
				name: payload.name,
				type: payload.type,
				openingBalance: payload.openingBalance,
			};
			walletStore.create(request);
		}
	};

	const handleExport = (): void => {
		const rows = readyOr(walletStore.filteredWallets, []);

		const columns: CsvColumn<Wallet>[] = [
			{ header: t("wallet.table.name"), value: (w) => w.name },
			{ header: t("wallet.table.type"), value: (w) => t(WALLET_TYPE_META[w.type].labelKey) },
			{ header: t("wallet.table.balance"), value: (w) => w.balance },
			{ header: t("wallet.table.advances"), value: (w) => w.advancesHeld },
			{ header: t("wallet.table.ourMoney"), value: (w) => w.ourMoney },
			{
				header: t("wallet.table.status"),
				value: (w) =>
					w.isArchived ? t("wallet.table.archivedBadge") : t("wallet.table.statusActive"),
			},
		];

		exportToCsv(`wallets_${csvDateStamp()}`, columns, rows);
	};

	const all = !isReady(walletStore.allWallets) ? null : walletStore.allWallets;
	const isFiltering = walletStore.searchTerm.trim().length > 0;
	const hasAny = (all?.length ?? 0) > 0;
	const hasActive = (all ?? []).some((w) => !w.isArchived);

	return (
		<Box>
			<WalletHeader
				searchValue={walletStore.searchTerm}
				showArchived={walletStore.showArchived}
				archivedCount={walletStore.archivedCount}
				onSearch={walletStore.setSearch}
				onToggleArchived={walletStore.setShowArchived}
				onCreate={walletStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(walletStore.filteredWallets, []).length}
			/>

			{all !== null && <WalletSummaryStrip summary={walletStore.summary} />}

			<WalletsTable
				onRetry={() => void walletStore.getAll()}
				errorTitle={t("wallet.error.getAll")}
				rows={walletStore.filteredWallets}
				showArchived={walletStore.showArchived}
				isFiltering={isFiltering}
				hasAny={hasAny}
				hasActive={hasActive}
				onOpen={(wallet) => navigate(walletDetailPath(wallet.id))}
				onCreate={walletStore.openCreate}
				onEdit={walletStore.openEdit}
				onArchive={walletStore.openArchive}
				onRestore={walletStore.openRestore}
				onDelete={walletStore.openDelete}
			/>

			<WalletFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={walletStore.isSaving}
				wallet={editingWallet}
				onClose={walletStore.closeDialog}
				onSave={handleFormSave}
			/>

			<WalletDialogs />
		</Box>
	);
});

export default WalletPage;
