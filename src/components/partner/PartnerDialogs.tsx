import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface PartnerDialogsProps {
	/** Detail page hooks to reflect the change in its ledger store / navigate. */
	onArchived?: (partner: Partner) => void;
	onRestored?: (partner: Partner) => void;
	onDeleted?: (partner: Partner) => void;
}

/**
 * The archive / restore / delete / cannot-delete confirm dialogs, driven by
 * `partnerStore.dialogMode`. Shared by the list and detail pages. Delete is
 * reference-gated: the row/detail menu routes a referenced partner to the
 * «cannot delete» warning (which offers archiving instead).
 */
export const PartnerDialogs: React.FC<PartnerDialogsProps> = observer(
	({ onArchived, onRestored, onDeleted }) => {
		const { t } = useTranslation();
		const { partnerStore } = useStore();
		const mode = partnerStore.dialogMode;

		const target =
			mode.kind === "archive" ||
			mode.kind === "restore" ||
			mode.kind === "delete" ||
			mode.kind === "cannotDelete"
				? mode.partner
				: null;
		const name = target?.name ?? "";

		const close = () => partnerStore.closeDialog();

		return (
			<>
				<ConfirmDialog
					isOpen={mode.kind === "archive"}
					icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("partner.archive.title", { name })}
					content={t("partner.archive.body")}
					confirmLabel={t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "archive") {
							void partnerStore.archive(mode.partner).then((p) => p && onArchived?.(p));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "restore"}
					icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="info"
					title={t("partner.restore.title", { name })}
					content={t("partner.restore.body")}
					confirmLabel={t("common.restore")}
					cancelLabel={t("common.cancel")}
					confirmVariant="primary"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "restore") {
							void partnerStore.restore(mode.partner).then((p) => p && onRestored?.(p));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "delete"}
					icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("partner.delete.title", { name })}
					content={t("partner.delete.body")}
					confirmLabel={t("partner.delete.confirm")}
					cancelLabel={t("common.cancel")}
					confirmVariant="danger"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "delete") {
							const partner = mode.partner;
							void partnerStore.remove(partner).then((ok) => ok && onDeleted?.(partner));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "cannotDelete"}
					icon={<ErrorOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("partner.cannotDelete.title")}
					content={t("partner.cannotDelete.body")}
					confirmLabel={t("partner.cannotDelete.confirm")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "cannotDelete") {
							void partnerStore.archive(mode.partner).then((p) => p && onArchived?.(p));
						}
					}}
				/>
			</>
		);
	},
);

export default PartnerDialogs;
