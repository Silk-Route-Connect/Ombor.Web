import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { useStore } from "stores/StoreContext";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface ProductDialogsProps {
	/** Detail page hooks to reflect the change / leave the deleted product's page. */
	onArchived?: (product: Product) => void;
	onRestored?: (product: Product) => void;
	onDeleted?: (product: Product) => void;
}

/**
 * Archive / restore / delete / cannot-delete confirmations driven by
 * `productStore.dialogMode`, shared by the list and detail pages. A referenced
 * product cannot be deleted — the dialog says why and offers archiving (pattern 19).
 */
export const ProductDialogs: React.FC<ProductDialogsProps> = observer(
	({ onArchived, onRestored, onDeleted }) => {
		const { t } = useTranslation();
		const { productStore } = useStore();
		const mode = productStore.dialogMode;

		const target =
			mode.kind === "archive" ||
			mode.kind === "restore" ||
			mode.kind === "delete" ||
			mode.kind === "cannotDelete"
				? mode.product
				: null;
		const name = target?.name ?? "";

		const archive = (product: Product) =>
			void productStore.archive(product).then((p) => p && onArchived?.(p));

		return (
			<>
				<ConfirmDialog
					isOpen={mode.kind === "archive"}
					icon={<ArchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("product.archive.title", { name })}
					content={t("product.archive.body")}
					confirmLabel={t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={productStore.closeDialog}
					onConfirm={() => mode.kind === "archive" && archive(mode.product)}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "restore"}
					icon={<UnarchiveOutlinedIcon sx={{ fontSize: 22 }} />}
					iconTone="info"
					title={t("product.restore.title", { name })}
					content={t("product.restore.body")}
					confirmLabel={t("common.restore")}
					cancelLabel={t("common.cancel")}
					confirmVariant="primary"
					onCancel={productStore.closeDialog}
					onConfirm={() => {
						if (mode.kind === "restore") {
							void productStore.restore(mode.product).then((p) => p && onRestored?.(p));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "delete"}
					icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("product.delete.title", { name })}
					content={t("product.delete.body")}
					confirmLabel={t("common.delete")}
					cancelLabel={t("common.cancel")}
					confirmVariant="danger"
					onCancel={productStore.closeDialog}
					onConfirm={() => {
						if (mode.kind === "delete") {
							const product = mode.product;
							void productStore.remove(product).then((ok) => ok && onDeleted?.(product));
						}
					}}
				/>

				<ConfirmDialog
					isOpen={mode.kind === "cannotDelete"}
					icon={<ErrorOutlineIcon sx={{ fontSize: 22 }} />}
					iconTone="warning"
					title={t("product.cannotDelete.title")}
					content={
						target?.isArchived
							? t("product.cannotDelete.bodyArchived")
							: t("product.cannotDelete.body")
					}
					confirmLabel={target?.isArchived ? t("common.understood") : t("common.archive")}
					cancelLabel={t("common.cancel")}
					confirmVariant="warning"
					onCancel={productStore.closeDialog}
					onConfirm={() => {
						if (mode.kind !== "cannotDelete") return;
						if (mode.product.isArchived) {
							productStore.closeDialog();
						} else {
							archive(mode.product);
						}
					}}
				/>
			</>
		);
	},
);

export default ProductDialogs;
