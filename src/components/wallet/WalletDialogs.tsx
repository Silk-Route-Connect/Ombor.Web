import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { Wallet } from "models/wallet";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WalletDialogsProps {
	/** Detail page hooks to reflect the change / leave the deleted wallet's page. */
	onArchived?: (wallet: Wallet) => void;
	onRestored?: (wallet: Wallet) => void;
	onDeleted?: (wallet: Wallet) => void;
}

/**
 * Archive / restore / delete / cannot-delete confirmations driven by
 * `walletStore.dialogMode`, shared by the list and detail pages (mirrors
 * WarehouseDialogs). A referenced wallet cannot be deleted — the dialog
 * explains why and offers archiving instead (pattern 19).
 */
export const WalletDialogs: React.FC<WalletDialogsProps> = observer(
	({ onArchived, onRestored, onDeleted }) => {
		const { t } = useTranslation();
		const { walletStore } = useStore();
		const mode = walletStore.dialogMode;

		const target =
			mode.kind === "archive" ||
			mode.kind === "restore" ||
			mode.kind === "delete" ||
			mode.kind === "cannotDelete"
				? mode.wallet
				: null;
		const name = target?.name ?? "";

		const archive = (wallet: Wallet) =>
			void walletStore.archive(wallet).then((w) => w && onArchived?.(w));

		return (
			<>
				<ConfirmDialog
					isOpen={mode.kind === "archive"}
					icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("wallet.archive.title", { name })}
					content={t("wallet.archive.body")}
					confirmLabel={t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={walletStore.closeDialog}
					onConfirm={() => mode.kind === "archive" && archive(mode.wallet)}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "restore"}
					icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="info"
					title={t("wallet.restore.title", { name })}
					content={t("wallet.restore.body")}
					confirmLabel={t("common.restore")}
					cancelLabel={t("common.cancel")}
					confirmVariant="primary"
					onCancel={walletStore.closeDialog}
					onConfirm={() => {
						if (mode.kind === "restore") {
							void walletStore.restore(mode.wallet).then((w) => w && onRestored?.(w));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "delete"}
					icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("wallet.delete.title", { name })}
					content={t("wallet.delete.body")}
					confirmLabel={t("common.delete")}
					cancelLabel={t("common.cancel")}
					confirmVariant="danger"
					onCancel={walletStore.closeDialog}
					onConfirm={() => {
						if (mode.kind === "delete") {
							const wallet = mode.wallet;
							void walletStore.remove(wallet).then((ok) => ok && onDeleted?.(wallet));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "cannotDelete"}
					icon={<ErrorOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("wallet.cannotDelete.title")}
					content={
						target?.isArchived
							? t("wallet.cannotDelete.bodyArchived")
							: t("wallet.cannotDelete.body")
					}
					confirmLabel={target?.isArchived ? t("common.understood") : t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={walletStore.closeDialog}
					onConfirm={() => {
						if (mode.kind !== "cannotDelete") return;
						if (mode.wallet.isArchived) {
							walletStore.closeDialog();
						} else {
							archive(mode.wallet);
						}
					}}
				/>
			</>
		);
	},
);

export default WalletDialogs;
