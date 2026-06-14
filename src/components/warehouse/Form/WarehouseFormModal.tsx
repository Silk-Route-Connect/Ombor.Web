import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useWarehouseForm } from "hooks/warehouse/useWarehouseForm";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";
import { WarehouseFormValues } from "schemas/WarehouseSchema";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Alert,
	Dialog,
	DialogContent,
	LinearProgress,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

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
	const { control, formState } = form;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	const errorCount = Object.keys(formState.errors).length;
	const showErrorBanner = formState.isSubmitted && errorCount > 0;

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 520, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={warehouse ? t("warehouse.title.edit") : t("warehouse.title.create")}
					subtitle={warehouse?.name}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{showErrorBanner && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "16px" }}
						>
							{t("warehouse.form.errorBanner")}
						</Alert>
					)}

					<Stack sx={{ gap: "16px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("warehouse.field.name")} required />
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
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("warehouse.field.address")} />
							<Controller
								name="location"
								control={control}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										value={field.value ?? ""}
										size="small"
										fullWidth
										placeholder={t("warehouse.form.addressPlaceholder")}
										disabled={isSaving}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
									/>
								)}
							/>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								{t("warehouse.form.addressHint")}
							</Typography>
						</Stack>
					</Stack>
				</DialogContent>

				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
				/>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("common.dialog.discardChanges.title")}
				content={t("common.dialog.discardChanges.body")}
				confirmLabel={t("common.dialog.discardChanges.confirm")}
				cancelLabel={t("common.dialog.discardChanges.cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default observer(WarehouseFormModal);
