import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import UzsUnit from "components/shared/Money/UzsUnit";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { usePartnerForm } from "hooks/partner/usePartnerForm";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { Partner, PartnerType } from "models/partner";
import { MAX_PHONES_COUNT, PartnerFormInputs, PartnerFormValues } from "schemas/PartnerSchema";
import { designTokens, dialogPaperSx, numericSx } from "theme";
import { formatDate as formatLocaleDate } from "utils/dateUtils";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import CheckIcon from "@mui/icons-material/Check";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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

const fmtThousands = (n: number): string => (n ? n.toLocaleString("ru-RU") : "");
const parseAmount = (raw: string): number => {
	const digits = raw.replace(/\D/g, "");
	return digits ? Number(digits) : 0;
};

const OptionalHint: React.FC = () => {
	const { t } = useTranslation();
	return (
		<Box component="span" sx={{ fontSize: 12, fontWeight: 400, color: "text.disabled", ml: "6px" }}>
			{t("partner.form.optional")}
		</Box>
	);
};

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
	const { control, formState, watch } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
	const { errors, isSubmitted } = formState;

	const openingType = watch("openingType");
	const openingAmount = watch("openingAmount") ?? 0;
	const signedOpening = openingType === "payable" ? -openingAmount : openingAmount;

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
						{/* Name + Company on one row (PRT-7) */}
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

						{/* Type */}
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

						{/* Email + Telegram */}
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

						{/* Address */}
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

						{/* Opening balance divider */}
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
							<Box>
								<Box sx={{ display: "flex", flexDirection: "column", gap: "7px", mb: "14px" }}>
									<FormFieldLabel label={t("partner.form.openingType")} />
									<Controller
										name="openingType"
										control={control}
										render={({ field }) => (
											<SegmentedControl<"receivable" | "payable">
												fullWidth
												value={field.value}
												onChange={field.onChange}
												disabled={isSaving}
												options={[
													{ value: "receivable", label: t("partner.form.openingReceivable") },
													{ value: "payable", label: t("partner.form.openingPayable") },
												]}
											/>
										)}
									/>
								</Box>

								<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
									<FormFieldLabel label={t("partner.form.openingAmount")} />
									<Controller
										name="openingAmount"
										control={control}
										render={({ field }) => (
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: "10px",
													px: "14px",
													py: "9px",
													minHeight: 44,
													border: "1px solid",
													borderColor: designTokens.gray300,
													borderRadius: "8px",
													bgcolor: "background.paper",
													"&:focus-within": { borderColor: "primary.main" },
												}}
											>
												<Box
													component="span"
													sx={{
														...numericSx,
														fontWeight: 700,
														fontSize: 20,
														color: partnerBalanceColor(signedOpening),
													}}
												>
													{openingType === "receivable" ? "−" : "+"}
												</Box>
												<Box
													component="input"
													inputMode="numeric"
													value={fmtThousands(field.value ?? 0)}
													placeholder="0"
													disabled={isSaving}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
														field.onChange(parseAmount(e.target.value))
													}
													sx={{
														...numericSx,
														flex: 1,
														minWidth: 0,
														border: "none",
														outline: "none",
														background: "none",
														fontWeight: 700,
														fontSize: 20,
														letterSpacing: "-0.01em",
														color: "text.primary",
														fontFamily: "inherit",
													}}
												/>
												<UzsUnit />
											</Box>
										)}
									/>
									{isSubmitted && errors.openingAmount?.message && (
										<Typography sx={{ fontSize: 12, color: "error.main" }}>
											{errors.openingAmount.message}
										</Typography>
									)}
								</Box>

								{openingAmount > 0 && (
									<Box
										sx={{
											mt: "12px",
											fontSize: 12.5,
											color: "text.secondary",
											display: "flex",
											alignItems: "center",
											gap: "8px",
										}}
									>
										{t("partner.form.openingPreview")}{" "}
										<Box
											component="b"
											sx={{
												...numericSx,
												fontWeight: 700,
												color: partnerBalanceColor(signedOpening),
											}}
										>
											{formatPartnerBalance(signedOpening)}
											<UzsUnit />
										</Box>
									</Box>
								)}
							</Box>
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

/** Locked opening-balance card shown on edit — the auditable event is read-only. */
const LockedOpeningBalance: React.FC<{ partner: Partner }> = ({ partner }) => {
	const { t } = useTranslation();
	return (
		<Box
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				bgcolor: designTokens.gray25,
				p: "16px 18px",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
				<Box
					sx={{
						width: 30,
						height: 30,
						borderRadius: "8px",
						display: "grid",
						placeItems: "center",
						bgcolor: "primary.light",
						color: "info.main",
						flex: "0 0 auto",
					}}
				>
					<FlagOutlinedIcon sx={{ fontSize: 16 }} />
				</Box>
				<Box>
					<Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
						{t("partner.form.openingLockedTitle")}
					</Typography>
					<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
						{t("partner.form.openingLockedSub", { date: formatLocaleDate(partner.openingDate) })}
					</Typography>
				</Box>
				<Box
					sx={{
						ml: "auto",
						...numericSx,
						fontWeight: 700,
						fontSize: 20,
						color: partnerBalanceColor(partner.openingBalance),
					}}
				>
					{formatPartnerBalance(partner.openingBalance)}
					<UzsUnit />
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					gap: "9px",
					alignItems: "flex-start",
					mt: "12px",
					p: "11px 13px",
					bgcolor: "primary.light",
					border: "1px solid",
					borderColor: designTokens.primaryLine,
					borderRadius: "8px",
				}}
			>
				<InfoOutlinedIcon sx={{ fontSize: 15, color: "info.main", mt: "1px", flex: "0 0 auto" }} />
				<Typography sx={{ fontSize: 12.5, color: "info.main", lineHeight: 1.55 }}>
					{t("partner.form.openingLockedHelper", {
						balance: formatPartnerBalance(partner.balance),
					})}
				</Typography>
			</Box>
		</Box>
	);
};

export default PartnerFormModal;
