import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { usePartnerForm } from "hooks/partner/usePartnerForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { Partner, PartnerType } from "models/partner";
import { MAX_PHONES_COUNT, PartnerFormInputs, PartnerFormValues } from "schemas/PartnerSchema";
import { designTokens, dialogPaperSx, numericSx } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	LinearProgress,
	TextField,
	Typography,
} from "@mui/material";

import LockedOpeningBalance from "./LockedOpeningBalance";
import PartnerOpeningBalanceFields from "./PartnerOpeningBalanceFields";

interface PartnerFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	/** Create only: values to start from (the POS picker's type and typed name). */
	defaults?: Partial<PartnerFormInputs>;
	onSave: (values: PartnerFormValues) => void;
	onClose: () => void;
}

const TYPE_OPTIONS: PartnerType[] = ["Customer", "Supplier", "Both"];

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
	isOpen,
	isSaving,
	partner,
	defaults,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const isEdit = Boolean(partner);

	const { form, submit, discardOpen, requestClose, confirmDiscard, cancelDiscard } = usePartnerForm(
		{
			isOpen,
			isSaving,
			partner,
			defaults,
			onSave,
			onClose,
		},
	);
	const { control, formState } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
	const { errors, isSubmitted } = formState;

	// RHF stores a per-row error at phoneErrors[i] and the array-level "at least
	// one phone" refine at phoneErrors.message — the two shapes are mutually
	// exclusive here, so reading both lets each render in its own place.
	const phoneErrors = errors.phoneNumbers as
		| (Partial<{ message: string }> & Array<FieldError | undefined>)
		| undefined;

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				onKeyDown={onKeyDown}
				slotProps={{ paper: { sx: dialogPaperSx("md") } }}
			>
				<FormDialogHeader
					title={isEdit ? t("partner.form.editTitle") : t("partner.form.createTitle")}
					subtitle={isEdit ? (partner?.name ?? undefined) : undefined}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
								gap: "16px",
							}}
						>
							<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
								<FormFieldLabel label={t("partner.form.name")} required />
								<Controller
									name="name"
									control={control}
									render={({ field, fieldState }) => (
										<TextField
											{...field}
											size="small"
											fullWidth
											autoFocus={!isEdit}
											placeholder={t("partner.form.namePlaceholder")}
											disabled={isSaving}
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
										/>
									)}
								/>
							</Box>
							<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
								<FormFieldLabel label={t("partner.form.company")} />
								<Controller
									name="companyName"
									control={control}
									render={({ field, fieldState }) => (
										<TextField
											{...field}
											value={field.value ?? ""}
											size="small"
											fullWidth
											placeholder={t("partner.form.companyPlaceholder")}
											disabled={isSaving}
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
										/>
									)}
								/>
							</Box>
						</Box>

						<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
							<FormFieldLabel label={t("partner.form.type")} required />
							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<SegmentedControl<PartnerType>
										fullWidth
										value={field.value}
										onChange={field.onChange}
										disabled={isSaving}
										options={TYPE_OPTIONS.map((type) => ({
											value: type,
											label: t(`partner.typeShort.${type}`),
										}))}
									/>
								)}
							/>
						</Box>

						<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
							<FormFieldLabel label={t("partner.form.phones")} required />
							<Controller
								name="phoneNumbers"
								control={control}
								render={({ field }) => (
									<PhoneListField
										disabled={isSaving}
										values={field.value.length > 0 ? field.value : [""]}
										errors={isSubmitted && Array.isArray(phoneErrors) ? phoneErrors : []}
										listError={isSubmitted ? phoneErrors?.message : undefined}
										maxCount={MAX_PHONES_COUNT}
										onChange={field.onChange}
										onBlur={field.onBlur}
									/>
								)}
							/>
						</Box>

						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
								gap: "16px",
							}}
						>
							<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
								<FormFieldLabel label={t("partner.form.email")} />
								<Controller
									name="email"
									control={control}
									render={({ field, fieldState }) => (
										<TextField
											{...field}
											value={field.value ?? ""}
											size="small"
											fullWidth
											placeholder={t("partner.form.emailPlaceholder")}
											disabled={isSaving}
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
										/>
									)}
								/>
							</Box>
							<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
								<FormFieldLabel label={t("partner.form.telegram")} />
								<Controller
									name="telegram"
									control={control}
									render={({ field, fieldState }) => (
										<TextField
											{...field}
											value={field.value ?? ""}
											size="small"
											fullWidth
											placeholder={t("partner.form.telegramPlaceholder")}
											disabled={isSaving}
											error={!!fieldState.error}
											helperText={fieldState.error?.message}
											sx={numericSx}
										/>
									)}
								/>
							</Box>
						</Box>

						<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
							<FormFieldLabel label={t("partner.form.address")} />
							<Controller
								name="address"
								control={control}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										value={field.value ?? ""}
										size="small"
										fullWidth
										multiline
										minRows={2}
										placeholder={t("partner.form.addressPlaceholder")}
										disabled={isSaving}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
									/>
								)}
							/>
						</Box>

						<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
							<Typography
								sx={{
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "text.disabled",
								}}
							>
								{t("partner.form.openingSection")}
							</Typography>
							<Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
						</Box>

						{isEdit ? (
							<LockedOpeningBalance partner={partner!} />
						) : (
							<PartnerOpeningBalanceFields form={form} isSaving={isSaving} />
						)}
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "10px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
					}}
				>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit} disabled={isSaving}>
						{isEdit ? t("partner.form.submitEdit") : t("partner.form.submitCreate")}
					</PrimaryButton>
				</DialogActions>
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

export default PartnerFormModal;
