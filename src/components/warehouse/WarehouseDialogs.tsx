import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface WarehouseDialogsProps {
	/** Detail page hooks to reflect the change in its selected-warehouse store / navigate. */
	onArchived?: (warehouse: Warehouse) => void;
	onRestored?: (warehouse: Warehouse) => void;
	onDeleted?: (warehouse: Warehouse) => void;
}

/**
 * The archive / restore / delete / cannot-delete confirm dialogs, driven by
 * `warehouseStore.dialogMode`. Shared by the list and detail pages (mirrors
 * PartnerDialogs). Delete is reference-gated (business-rules rule 32): the
 * row/detail menu routes a referenced warehouse to the «cannot delete» warning,
 * which offers archiving instead.
 */
export const WarehouseDialogs: React.FC<WarehouseDialogsProps> = observer(
	({ onArchived, onRestored, onDeleted }) => {
		const { t } = useTranslation();
		const { warehouseStore } = useStore();
		const mode = warehouseStore.dialogMode;

		const target =
			mode.kind === "archive" ||
			mode.kind === "restore" ||
			mode.kind === "delete" ||
			mode.kind === "cannotDelete"
				? mode.warehouse
				: null;
		const name = target?.name ?? "";

		const close = () => warehouseStore.closeDialog();

		return (
			<>
				<ConfirmDialog
					isOpen={mode.kind === "archive"}
					icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("warehouse.archive.title", { name })}
					content={t("warehouse.archive.body")}
					confirmLabel={t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "archive") {
							void warehouseStore.archive(mode.warehouse).then((w) => w && onArchived?.(w));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "restore"}
					icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="info"
					title={t("warehouse.restore.title", { name })}
					content={t("warehouse.restore.body")}
					confirmLabel={t("common.restore")}
					cancelLabel={t("common.cancel")}
					confirmVariant="primary"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "restore") {
							void warehouseStore.restore(mode.warehouse).then((w) => w && onRestored?.(w));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "delete"}
					icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("warehouse.delete.title", { name })}
					content={t("warehouse.delete.body")}
					confirmLabel={t("warehouse.delete.confirm")}
					cancelLabel={t("common.cancel")}
					confirmVariant="danger"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "delete") {
							const warehouse = mode.warehouse;
							void warehouseStore.remove(warehouse).then((ok) => ok && onDeleted?.(warehouse));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "cannotDelete"}
					icon={<ErrorOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("warehouse.cannotDelete.title")}
					content={t("warehouse.cannotDelete.body")}
					confirmLabel={t("warehouse.cannotDelete.confirm")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={close}
					onConfirm={() => {
						if (mode.kind === "cannotDelete") {
							void warehouseStore.archive(mode.warehouse).then((w) => w && onArchived?.(w));
						}
					}}
				/>
			</>
		);
	},
);

export default WarehouseDialogs;
