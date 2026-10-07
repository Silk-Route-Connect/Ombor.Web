import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useStockThresholdForm } from "hooks/warehouse/useStockThresholdForm";
import { observer } from "mobx-react-lite";
import { WarehouseStockItem } from "models/warehouse";
import { useStore } from "stores/StoreContext";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Tooltip, Typography } from "@mui/material";

import ThresholdField from "./ThresholdField";

interface StockThresholdDialogProps {
	/** The row being edited; null keeps the dialog closed. */
	row: WarehouseStockItem | null;
	warehouseName: string;
	isSaving: boolean;
	/** A number sets the threshold, null stops tracking the row. */
	onSave: (value: number | null) => void;
	onClose: () => void;
}

/**
 * «Порог «Заканчивается»» of one product in one warehouse (DR-41): the stock on
 * hand for reference, one optional threshold in the product's unit (empty = not
 * tracked), «Сохранить», and «Убрать порог» while one is set. A row setting, not
 * a stock event — no commit wording.
 */
const StockThresholdDialog: React.FC<StockThresholdDialogProps> = ({
	row,
	warehouseName,
	isSaving,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { connectivityStore } = useStore();
	// The last opened row stays on screen while the dialog fades out after a save.
	const [shownRow, setShownRow] = useState(row);
	if (row !== null && row !== shownRow) {
		setShownRow(row);
	}
	const { form, canSave, submit } = useStockThresholdForm({ row, isSaving, onSave });
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
	const { control, formState } = form;
	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// An unchanged threshold closes without a request or a «saved» toast.
	const handleSave = (): void => {
		if (!formState.isDirty) {
			onClose();
			return;
		}
		void submit();
	};

	const tracked = shownRow?.lowStockThreshold != null;
	const offline = connectivityStore.isBackendDown;
	const unit = shownRow ? measurementShort(t, shownRow.measurement) : "";

	const clearButton = tracked && (
		<Tooltip title={offline ? t("common.offline.saveTooltip") : ""} placement="top">
			<span>
				<GhostButton
					icon={<RemoveCircleOutlineIcon />}
					onClick={() => onSave(null)}
					disabled={isSaving || offline}
				>
					{t("warehouse.threshold.clear")}
				</GhostButton>
			</span>
		</Tooltip>
	);

	return (
		<FormDialog
			open={row !== null}
			size="sm"
			title={t("warehouse.threshold.title")}
			subtitle={shownRow ? `${shownRow.productName} · ${warehouseName}` : undefined}
			tile={recordTile("Warehouse")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					summary={clearButton}
					onCancel={requestClose}
					onSave={handleSave}
					canSave={canSave}
					loading={isSaving}
				/>
			}
		>
			{shownRow && (
				<>
					<Typography variant="body2" sx={{ color: "text.secondary", mb: "12px" }}>
						{t("warehouse.threshold.onHand", {
							qty: `${formatQuantity(shownRow.quantity)} ${unit}`.trim(),
						})}
					</Typography>
					<FormField label={t("warehouse.threshold.label")} hint={t("common.optional")}>
						<Controller
							name="lowStockThreshold"
							control={control}
							render={({ field, fieldState }) => (
								<ThresholdField
									name={field.name}
									ref={field.ref}
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									measurement={shownRow.measurement}
									size="small"
									autoFocus
									placeholder={t("warehouse.threshold.placeholder")}
									disabled={isSaving}
									error={!!fieldState.error}
									helperText={fieldState.error?.message ?? t("warehouse.threshold.helper")}
								/>
							)}
						/>
					</FormField>
				</>
			)}
		</FormDialog>
	);
};

export default observer(StockThresholdDialog);
