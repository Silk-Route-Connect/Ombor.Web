import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EntityHistory from "components/activity/History/EntityHistory";
import DetailTabs, { DetailTabSpec } from "components/shared/Detail/DetailTabs";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import WalletArchivedBanner from "components/wallet/Detail/WalletArchivedBanner";
import WalletDetailHeader from "components/wallet/Detail/WalletDetailHeader";
import WalletDetailStats from "components/wallet/Detail/WalletDetailStats";
import WalletOperationsTab from "components/wallet/Detail/WalletOperationsTab";
import WalletTransferDetailModal from "components/wallet/Detail/WalletTransferDetailModal";
import WalletTransfersTab from "components/wallet/Detail/WalletTransfersTab";
import WalletFormModal from "components/wallet/Form/WalletFormModal";
import WalletTransferModal from "components/wallet/Form/WalletTransferModal";
import WalletDialogs from "components/wallet/WalletDialogs";
import { isLoadError, isPresent, isReady, readyOr } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { Wallet, WalletOperation } from "models/wallet";
import { PATHS, paymentDetailPath } from "routing/paths";
import { TransferFormValues, WalletFormValues } from "schemas/WalletSchema";
import { useStore } from "stores/StoreContext";

import { Box, Stack } from "@mui/material";

type WalletDetailTab = "operations" | "transfers" | "history";

const WalletDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const walletId = useRouteEntityId();
	const { walletStore, selectedWalletStore } = useStore();

	const [tab, setTab] = useState<WalletDetailTab>("operations");

	useEffect(() => {
		if (walletId !== null) {
			void selectedWalletStore.load(walletId);
		}
		// The transfer picker needs the full active-wallet list.
		walletStore.getAll();
		setTab("operations");
		return () => selectedWalletStore.clear();
	}, [walletId, selectedWalletStore, walletStore]);

	const wallet = walletId === null ? null : selectedWalletStore.wallet;
	const retry = () => walletId !== null && void selectedWalletStore.load(walletId);
	const dialogMode = walletStore.dialogMode;

	const activeWallets = readyOr(walletStore.activeWallets, []);

	if (!isPresent(wallet)) {
		return (
			<LoadStateView
				state={wallet}
				onRetry={retry}
				errorTitle={t("wallet.error.getById")}
				notFound={{ title: t("wallet.detail.notFound"), backTo: PATHS.wallets }}
			/>
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
		if (operation.paymentId != null) {
			navigate(paymentDetailPath(operation.paymentId));
		}
	};

	const handleOpenTransfer = (transferId: number): void => {
		const found = readyOr(selectedWalletStore.transfers, []).find((tr) => tr.id === transferId);
		if (found) {
			walletStore.openTransferDetail(found);
		}
	};

	const operationsState = selectedWalletStore.operations;
	const transfersState = selectedWalletStore.transfers;
	const operations = readyOr(operationsState, []);
	const transfers = readyOr(transfersState, []);
	const ledgersState = isLoadError(operationsState)
		? operationsState
		: isLoadError(transfersState)
			? transfersState
			: "loading";

	const tabs: DetailTabSpec<WalletDetailTab>[] = [
		{
			key: "operations",
			label: t("wallet.detail.tabs.operations"),
			count: isReady(operationsState) ? operations.length : undefined,
		},
		{
			key: "transfers",
			label: t("wallet.detail.tabs.transfers"),
			count: isReady(transfersState) ? transfers.length : undefined,
		},
		{ key: "history", label: t("activity.history.tab") },
	];

	return (
		<Box>
			<WalletDetailHeader
				wallet={wallet}
				onNewTransfer={() => walletStore.openTransfer(wallet.id)}
				onEdit={() => walletStore.openEdit(wallet)}
				onArchive={() => walletStore.openArchive(wallet)}
				onRestore={() => walletStore.openRestore(wallet)}
				onDelete={() => walletStore.openDelete(wallet)}
			/>

			{wallet.isArchived && <WalletArchivedBanner />}

			<WalletDetailStats wallet={wallet} />

			<Stack sx={{ gap: "16px" }}>
				<DetailTabs tabs={tabs} active={tab} onChange={setTab} />

				{tab === "history" ? (
					<EntityHistory kind="Wallet" id={wallet.id} refreshKey={wallet} />
				) : !isReady(operationsState) || !isReady(transfersState) ? (
					<LoadStateView
						state={ledgersState}
						size="section"
						onRetry={retry}
						errorTitle={t("wallet.error.getOperations")}
					/>
				) : tab === "operations" ? (
					<WalletOperationsTab
						walletName={wallet.name}
						operations={operations}
						onOpenPayment={handleOpenPayment}
						onOpenTransfer={handleOpenTransfer}
					/>
				) : (
					<WalletTransfersTab
						walletName={wallet.name}
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

			<WalletDialogs
				onArchived={reflect}
				onRestored={reflect}
				onDeleted={() => navigate(PATHS.wallets)}
			/>
		</Box>
	);
});

export default WalletDetailPage;
