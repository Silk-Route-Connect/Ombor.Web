import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import WalletArchivedBanner from "components/wallet/Detail/WalletArchivedBanner";
import WalletDetailHeader from "components/wallet/Detail/WalletDetailHeader";
import WalletDetailStats from "components/wallet/Detail/WalletDetailStats";
import WalletDetailTabs, { WalletDetailTab } from "components/wallet/Detail/WalletDetailTabs";
import WalletOperationsTab from "components/wallet/Detail/WalletOperationsTab";
import WalletTransferDetailModal from "components/wallet/Detail/WalletTransferDetailModal";
import WalletTransfersTab from "components/wallet/Detail/WalletTransfersTab";
import WalletFormModal from "components/wallet/Form/WalletFormModal";
import WalletTransferModal from "components/wallet/Form/WalletTransferModal";
import { observer } from "mobx-react-lite";
import { Wallet, WalletOperation } from "models/wallet";
import { PATHS, paymentDetailPath } from "routing/paths";
import { TransferFormValues, WalletFormValues } from "schemas/WalletSchema";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const WalletDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams<{ id: string }>();
	const walletId = Number(id);
	const { walletStore, selectedWalletStore, notificationStore } = useStore();

	const [tab, setTab] = useState<WalletDetailTab>("operations");

	useEffect(() => {
		if (Number.isFinite(walletId)) {
			selectedWalletStore.load(walletId);
		}
		// The transfer picker needs the full active-wallet list.
		walletStore.getAll();
		setTab("operations");
		return () => selectedWalletStore.clear();
	}, [walletId, selectedWalletStore, walletStore]);

	const goBack = () => (location.key === "default" ? navigate(PATHS.wallets) : navigate(-1));

	const wallet = selectedWalletStore.wallet;
	const dialogMode = walletStore.dialogMode;

	const activeWallets = useMemo(
		() =>
			walletStore.allWallets === "loading"
				? []
				: walletStore.allWallets.filter((w) => !w.isArchived),
		[walletStore.allWallets],
	);

	if (wallet === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (wallet === null) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("wallet.detail.notFound")}</Typography>
			</Box>
		);
	}

	const reflect = (updated: Wallet | null): void => {
		if (updated) {
			selectedWalletStore.applyWallet(updated);
		}
	};

	const handleFormSave = async (payload: WalletFormValues): Promise<void> => {
		const updated = await walletStore.update({ id: wallet.id, name: payload.name });
		reflect(updated);
	};

	const handleTransferSave = async (payload: TransferFormValues): Promise<void> => {
		const created = await walletStore.createTransfer({
			fromWalletId: payload.fromWalletId,
			toWalletId: payload.toWalletId,
			amount: payload.amount,
			note: payload.note,
		});
		if (created) {
			// The transfer may have touched this wallet's balance + ledgers.
			await selectedWalletStore.reload(wallet.id);
		}
	};

	const handleOpenPayment = (operation: WalletOperation): void => {
		if (operation.paymentId) {
			navigate(paymentDetailPath(operation.paymentId));
			return;
		}
		// Fallback for the self-contained mock (no real payment id to link to).
		notificationStore.info(t("wallet.operations.openPayment", { number: operation.paymentNumber }));
	};

	const handleOpenTransfer = (transferId: number): void => {
		const found =
			selectedWalletStore.transfers === "loading"
				? undefined
				: selectedWalletStore.transfers.find((tr) => tr.id === transferId);
		if (found) {
			walletStore.openTransferDetail(found);
		}
	};

	const operations =
		selectedWalletStore.operations === "loading" ? [] : selectedWalletStore.operations;
	const transfers =
		selectedWalletStore.transfers === "loading" ? [] : selectedWalletStore.transfers;
	const ledgersLoading =
		selectedWalletStore.operations === "loading" || selectedWalletStore.transfers === "loading";

	return (
		<Box>
			<WalletDetailHeader
				wallet={wallet}
				onBack={goBack}
				onNewTransfer={() => walletStore.openTransfer(wallet.id)}
				onEdit={() => walletStore.openEdit(wallet)}
				onArchive={() => walletStore.openArchive(wallet)}
				onRestore={() => void walletStore.restore(wallet).then(reflect)}
			/>

			{wallet.isArchived && <WalletArchivedBanner />}

			<WalletDetailStats wallet={wallet} />

			<Stack sx={{ gap: "16px" }}>
				<WalletDetailTabs
					value={tab}
					operationsCount={operations.length}
					transfersCount={transfers.length}
					onChange={setTab}
				/>

				{ledgersLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
						<CircularProgress size={28} />
					</Box>
				) : tab === "operations" ? (
					<WalletOperationsTab
						operations={operations}
						onOpenPayment={handleOpenPayment}
						onOpenTransfer={handleOpenTransfer}
					/>
				) : (
					<WalletTransfersTab
						transfers={transfers}
						canTransfer={!wallet.isArchived}
						onNewTransfer={() => walletStore.openTransfer(wallet.id)}
						onOpenTransfer={handleOpenTransfer}
					/>
				)}
			</Stack>

			<WalletFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={walletStore.isSaving}
				wallet={dialogMode.kind === "form" ? (dialogMode.wallet ?? null) : null}
				onClose={walletStore.closeDialog}
				onSave={handleFormSave}
			/>

			<WalletTransferModal
				isOpen={dialogMode.kind === "transfer"}
				isSaving={walletStore.isSaving}
				wallets={activeWallets}
				fromWalletId={dialogMode.kind === "transfer" ? dialogMode.fromWalletId : undefined}
				onClose={walletStore.closeDialog}
				onSave={handleTransferSave}
			/>

			<WalletTransferDetailModal
				transfer={dialogMode.kind === "transferDetail" ? dialogMode.transfer : null}
				onClose={walletStore.closeDialog}
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
						void walletStore.archive(dialogMode.wallet).then(reflect);
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
						void walletStore.restore(dialogMode.wallet).then(reflect);
					}
				}}
			/>
		</Box>
	);
});

export default WalletDetailPage;
