import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import FormSection from "components/shared/Forms/FormSection";
import { recordTile } from "components/shared/IconTile/recordTile";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { usePartnerForm } from "hooks/partner/usePartnerForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { Partner, PartnerType } from "models/partner";
import { MAX_PHONES_COUNT, PartnerFormInputs, PartnerFormValues } from "schemas/PartnerSchema";
import { numericSx } from "theme";

import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Box, TextField } from "@mui/material";

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
		<FormDialog
			open={isOpen}
			size="md"
			title={isEdit ? t("partner.form.editTitle") : t("partner.form.createTitle")}
			subtitle={isEdit ? (partner?.name ?? undefined) : undefined}
			tile={recordTile("Partner")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					canSave={!isSaving}
					loading={isSaving}
					onCancel={requestClose}
					onSave={submit}
					submitLabel={isEdit ? undefined : t("partner.form.submitCreate")}
				/>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
						gap: "16px",
					}}
				>
					<FormField label={t("partner.form.name")} required>
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
					</FormField>
					<FormField label={t("partner.form.company")}>
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
					</FormField>
				</Box>

				<FormField label={t("partner.form.type")} required>
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<SegmentedControl<PartnerType>
								variant="form"
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
				</FormField>

				<FormField label={t("partner.form.phones")} required>
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
				</FormField>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
						gap: "16px",
					}}
				>
					<FormField label={t("partner.form.email")}>
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
					</FormField>
					<FormField label={t("partner.form.telegram")}>
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
					</FormField>
				</Box>

				<FormField label={t("partner.form.address")}>
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
				</FormField>

				<FormSection title={t("partner.form.openingSection")} icon={<FlagOutlinedIcon />}>
					{isEdit ? (
						<LockedOpeningBalance partner={partner!} />
					) : (
						<PartnerOpeningBalanceFields form={form} isSaving={isSaving} />
					)}
				</FormSection>
			</Box>
		</FormDialog>
	);
};

export default PartnerFormModal;
