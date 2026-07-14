import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { formatSigned } from "components/partner/Detail/ledgerHelpers";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { usePartnerForm } from "hooks/partner/usePartnerForm";
import { Partner, PartnerType } from "models/partner";
import { PartnerFormValues } from "schemas/PartnerSchema";
import { designTokens, numericSx } from "theme";
import { formatDate as formatLocaleDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { balanceColor } from "utils/partnerUtils";
import { formatUzNational, UZ_COUNTRY_PREFIX, uzPhoneToStored } from "utils/phoneUtils";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Alert,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	InputAdornment,
	LinearProgress,
	TextField,
	Typography,
} from "@mui/material";

interface PartnerFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	onSave: (values: PartnerFormValues) => void;
	onClose: () => void;
}

const TYPE_OPTIONS: PartnerType[] = ["Customer", "Supplier", "Both"];
const MAX_PHONES = 5;

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
			onSave,
			onClose,
		},
	);
	const { control, formState, watch } = form;
	const { errors, isSubmitted } = formState;

	const openingType = watch("openingType");
	const openingAmount = watch("openingAmount") ?? 0;
	const signedOpening = openingType === "payable" ? -openingAmount : openingAmount;

	// RHF stores a per-row error at phoneErrors[i] and the array-level "at least
	// one phone" refine at phoneErrors.message — the two shapes are mutually
	// exclusive here, so reading both lets each render in its own place.
	const phoneErrors = errors.phoneNumbers as
		| (Partial<{ message: string }> & Array<{ message?: string } | undefined>)
		| undefined;
	const showBanner =
		isSubmitted && (Boolean(errors.name) || Boolean(phoneErrors) || Boolean(errors.openingAmount));

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 620, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={isEdit ? t("partner.form.editTitle") : t("partner.form.createTitle")}
					subtitle={isEdit ? (partner?.name ?? undefined) : undefined}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{showBanner && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "18px" }}
						>
							{t("partner.form.errorBanner")}
						</Alert>
					)}

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

						{/* Phones */}
						<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
							<FormFieldLabel label={t("partner.form.phones")} required />
							<Controller
								name="phoneNumbers"
								control={control}
								render={({ field }) => {
									const phones = field.value.length > 0 ? field.value : [""];
									const setAt = (i: number, v: string) =>
										field.onChange(phones.map((p, j) => (j === i ? v : p)));
									const removeAt = (i: number) => {
										const next = phones.filter((_, j) => j !== i);
										field.onChange(next.length ? next : [""]);
									};
									const add = () => {
										if (phones.length < MAX_PHONES) {
											field.onChange([...phones, ""]);
										}
									};
									return (
										<Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
											{phones.map((phone, i) => {
												const rowError = isSubmitted ? phoneErrors?.[i]?.message : undefined;
												return (
													<Box
														key={i}
														sx={{ display: "flex", flexDirection: "column", gap: "4px" }}
													>
														<Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
															<TextField
																value={formatUzNational(phone)}
																onChange={(e) => setAt(i, uzPhoneToStored(e.target.value))}
																size="small"
																fullWidth
																inputMode="numeric"
																placeholder="90 123 45 67"
																disabled={isSaving}
																error={
																	Boolean(rowError) ||
																	(i === 0 && isSubmitted && Boolean(phoneErrors?.message))
																}
																sx={numericSx}
																slotProps={{
																	input: {
																		startAdornment: (
																			<InputAdornment position="start">
																				<Typography
																					sx={{ color: "text.secondary", fontWeight: 600 }}
																				>
																					{UZ_COUNTRY_PREFIX}
																				</Typography>
																			</InputAdornment>
																		),
																	},
																}}
															/>
															{phones.length > 1 && (
																<IconButton
																	onClick={() => removeAt(i)}
																	aria-label={t("common.delete")}
																	sx={{
																		width: 38,
																		height: 40,
																		flex: "0 0 auto",
																		borderRadius: "8px",
																		border: "1px solid",
																		borderColor: designTokens.gray300,
																		color: "text.disabled",
																		"&:hover": {
																			color: "error.main",
																			borderColor: designTokens.errorBorder,
																			bgcolor: designTokens.errorBg,
																		},
																	}}
																>
																	<CloseIcon sx={{ fontSize: 16 }} />
																</IconButton>
															)}
														</Box>
														{rowError && (
															<Typography sx={{ fontSize: 12, color: "error.main" }}>
																{rowError}
															</Typography>
														)}
													</Box>
												);
											})}
											{isSubmitted && phoneErrors?.message && (
												<Typography sx={{ fontSize: 12, color: "error.main" }}>
													{phoneErrors.message}
												</Typography>
											)}
											{phones.length < MAX_PHONES ? (
												<Box
													component="button"
													type="button"
													onClick={add}
													sx={{
														alignSelf: "flex-start",
														display: "inline-flex",
														alignItems: "center",
														gap: "6px",
														border: "none",
														background: "none",
														cursor: "pointer",
														color: "primary.main",
														fontWeight: 600,
														fontSize: 13,
														fontFamily: "inherit",
														p: "4px 2px",
													}}
												>
													<AddIcon sx={{ fontSize: 16 }} />
													{t("partner.form.addPhone")}
												</Box>
											) : (
												<Typography sx={{ fontSize: 12, color: "text.disabled" }}>
													{t("partner.form.maxPhones")}
												</Typography>
											)}
										</Box>
									);
								}}
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
														color: balanceColor(signedOpening),
													}}
												>
													{openingType === "payable" ? "−" : "+"}
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
												<Box
													component="span"
													sx={{ color: "text.disabled", fontSize: 13, fontWeight: 600 }}
												>
													UZS
												</Box>
											</Box>
										)}
									/>
									<Typography
										sx={{
											fontSize: 12,
											fontWeight: 600,
											color: "text.secondary",
											lineHeight: 1.45,
										}}
									>
										{t("partner.form.openingHint")}
									</Typography>
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
											sx={{ ...numericSx, fontWeight: 700, color: balanceColor(signedOpening) }}
										>
											{signedOpening >= 0 ? "+" : "−"}
											{formatCurrency(Math.abs(signedOpening))} UZS
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
						color: balanceColor(partner.openingBalance),
					}}
				>
					{formatSigned(partner.openingBalance)}
					<Box
						component="span"
						sx={{ fontSize: 11.5, fontWeight: 600, color: "text.disabled", ml: "6px" }}
					>
						UZS
					</Box>
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
						balance: formatSigned(partner.balance),
					})}
				</Typography>
			</Box>
		</Box>
	);
};

export default PartnerFormModal;
