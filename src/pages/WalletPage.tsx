import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import WalletFormModal from "components/wallet/Form/WalletFormModal";
import WalletHeader from "components/wallet/Header/WalletHeader";
import WalletsTable from "components/wallet/List/WalletsTable";
import WalletSummaryStrip from "components/wallet/List/WalletSummaryStrip";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { observer } from "mobx-react-lite";
import { CreateWalletRequest, Wallet } from "models/wallet";
import { walletDetailPath } from "routing/paths";
import { WalletFormValues } from "schemas/WalletSchema";
import { useStore } from "stores/StoreContext";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
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
		const rows = walletStore.filteredWallets === "loading" ? [] : walletStore.filteredWallets;

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

	const all = walletStore.allWallets === "loading" ? null : walletStore.allWallets;
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
			/>

			<WalletSummaryStrip summary={walletStore.summary} />

			<WalletsTable
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
			/>

			<WalletFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={walletStore.isSaving}
				wallet={editingWallet}
				onClose={walletStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "archive"}
				icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("wallet.archive.title", {
					name: dialogMode.kind === "archive" ? dialogMode.wallet.name : "",
				})}
				content={t("wallet.archive.body")}
				confirmLabel={t("common.archive")}
				cancelLabel={t("common.cancel")}
				confirmVariant="warning"
				onCancel={walletStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "archive") {
						void walletStore.archive(dialogMode.wallet);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "restore"}
				icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("wallet.restore.title", {
					name: dialogMode.kind === "restore" ? dialogMode.wallet.name : "",
				})}
				content={t("wallet.restore.body")}
				confirmLabel={t("common.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={walletStore.closeDialog}
				onConfirm={() => {
					if (dialogMode.kind === "restore") {
						void walletStore.restore(dialogMode.wallet);
					}
				}}
			/>
		</Box>
	);
});

export default WalletPage;
