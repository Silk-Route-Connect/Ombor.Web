import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useWarehouseForm } from "hooks/warehouse/useWarehouseForm";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { WarehouseFormValues } from "schemas/WarehouseSchema";

import { Stack, TextField } from "@mui/material";

export interface WarehouseFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	warehouse?: Warehouse | null;
	onSave: (payload: WarehouseFormValues) => void;
	onClose: () => void;
}

const WarehouseFormModal: React.FC<WarehouseFormModalProps> = ({
	isOpen,
	isSaving,
	warehouse,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { form, canSave, submit } = useWarehouseForm({ isOpen, isSaving, warehouse, onSave });
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
	const { control, formState } = form;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	// B9: an unchanged edit shouldn't fire a needless save/«сохранено» toast. The
	// button stays enabled (hard rule 5); it simply closes when nothing changed.
	const handleSave = (): void => {
		if (warehouse && !formState.isDirty) {
			onClose();
			return;
		}
		void submit();
	};

	return (
		<FormDialog
			open={isOpen}
			size="sm"
			title={warehouse ? t("warehouse.title.edit") : t("warehouse.title.create")}
			subtitle={warehouse?.name}
			tile={recordTile("Warehouse")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					onCancel={requestClose}
					onSave={handleSave}
					canSave={canSave}
					loading={isSaving}
					submitLabel={warehouse ? undefined : t("warehouse.form.submitCreate")}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<FormField label={t("warehouse.field.name")} required>
					<Controller
						name="name"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								size="small"
								fullWidth
								placeholder={t("warehouse.form.namePlaceholder")}
								disabled={isSaving}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
				</FormField>

				<FormField label={t("warehouse.field.address")}>
					<Controller
						name="location"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								value={field.value ?? ""}
								size="small"
								fullWidth
								multiline
								minRows={2}
								placeholder={t("warehouse.form.addressPlaceholder")}
								disabled={isSaving}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
				</FormField>
			</Stack>
		</FormDialog>
	);
};

export default observer(WarehouseFormModal);
