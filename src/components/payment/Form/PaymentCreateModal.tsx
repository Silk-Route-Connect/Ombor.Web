import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PAYMENT_TYPE_META } from "components/payment/PaymentPresentation";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { autoDirection, usePaymentForm } from "hooks/payment/usePaymentForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { observer } from "mobx-react-lite";
import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PAYMENT_TYPES,
	PaymentFormData,
	PaymentType,
	SettlementInput,
} from "models/payment";
import { PaymentFormValues } from "schemas/PaymentSchema";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Alert,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	InputAdornment,
	LinearProgress,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

import PaymentSettlementModal from "./PaymentSettlementModal";

const MONTHS = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];
const YEARS = ["2026", "2025"];

/**
 * Bounded, anchored-below dropdown menu — keeps long pickers (the partner list)
 * from spilling as a full-page overlay; opens below the field, capped + scrollable (PAY-7).
 */
const DROPDOWN_MENU_PROPS = {
	anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
	transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
	slotProps: { paper: { sx: { maxHeight: 320, mt: "4px" } } },
};

export interface PaymentCreateModalProps {
	isOpen: boolean;
	isSaving: boolean;
	formData: PaymentFormData | "loading";
	outstanding: OutstandingTransaction[] | "loading";
	onLoadOutstanding: (partnerId: number) => void;
	onSave: (request: CreatePaymentRecordRequest) => void;
	onClose: () => void;
}

const DirectionChoice: React.FC<{
	value: "Income" | "Expense";
	onChange: (v: "Income" | "Expense") => void;
}> = ({ value, onChange }) => {
	const { t } = useTranslation();
	return (
		<SegmentedControl
			fullWidth
			value={value}
			onChange={onChange}
			options={[
				{ value: "Income", label: t("payment.direction.income") },
				{ value: "Expense", label: t("payment.direction.expense") },
			]}
		/>
	);
};

const PaymentCreateModal: React.FC<PaymentCreateModalProps> = ({
	isOpen,
	isSaving,
	formData,
	outstanding,
	onLoadOutstanding,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const { form } = usePaymentForm({ isOpen });
	const { control, watch, setValue, handleSubmit, formState } = form;
	const [settleOpen, setSettleOpen] = useState(false);

	const data = formData === "loading" ? { partners: [], employees: [], wallets: [] } : formData;

	const type = watch("type") as PaymentType;
	const partnerId = watch("partnerId");
	const employeeId = watch("employeeId");
	const amount = watch("amount");
	const userDir = watch("direction");

	const partner = data.partners.find((p) => p.id === partnerId) ?? null;
	const employee = data.employees.find((e) => e.id === employeeId) ?? null;

	const needsPartner = type === "Transaction" || type === "Deposit" || type === "Withdrawal";
	const autoDir = autoDirection(type, partner?.type ?? null);
	const needsDirChoice = autoDir === null;
	const effectiveDir = autoDir ?? userDir;

	const overWithdraw = type === "Withdrawal" && partner != null && amount > partner.advance;

	// Load the partner's outstanding when settling, so the debts banner + the
	// settlement modal have data ready.
	useEffect(() => {
		if (type === "Transaction" && partnerId) {
			onLoadOutstanding(partnerId);
		}
	}, [type, partnerId, onLoadOutstanding]);

	const hasOpenDebts =
		type === "Transaction" &&
		partner != null &&
		outstanding !== "loading" &&
		outstanding.length > 0;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	const buildRequest = (settlements: SettlementInput[]): CreatePaymentRecordRequest => ({
		type,
		direction: effectiveDir,
		partnerId: needsPartner ? partnerId : null,
		employeeId: type === "Payroll" ? employeeId : null,
		walletId: watch("walletId") as number,
		amount,
		description: type === "General" ? watch("description") : null,
		period: type === "Payroll" ? `${watch("month")} ${watch("year")}` : null,
		settlements,
	});

	const onValid = (_values: PaymentFormValues): void => {
		if (overWithdraw) {
			return; // inline error shown; block submit
		}
		if (type === "Transaction") {
			setSettleOpen(true); // distribute, then create on confirm
			return;
		}
		onSave(buildRequest([]));
	};

	const submit = handleSubmit(onValid);

	const errorCount = Object.keys(formState.errors).length;
	const showErrorBanner = formState.isSubmitted && (errorCount > 0 || overWithdraw);

	const fieldError = (name: keyof PaymentFormValues): string | undefined =>
		(formState.errors[name]?.message as string | undefined) ?? undefined;

	return (
		<>
			<Dialog
				open={isOpen && !settleOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 720, maxWidth: "96%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t("payment.form.title")}
					subtitle={t("payment.form.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{/* STEP 1 — type */}
					<Stack sx={{ gap: "7px", mb: "16px" }}>
						<FormFieldLabel label={t("payment.form.typeLabel")} />
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<SegmentedControl
									fullWidth
									value={field.value}
									onChange={(v) => {
										field.onChange(v);
										setValue("direction", v === "General" ? "Expense" : "Income");
									}}
									options={PAYMENT_TYPES.map((pt) => ({
										value: pt,
										label: t(PAYMENT_TYPE_META[pt].labelKey),
									}))}
								/>
							)}
						/>
					</Stack>
					<Box sx={{ height: "1px", bgcolor: "divider", mb: "20px" }} />

					{showErrorBanner && (
						<Alert severity="error" variant="outlined" sx={{ mb: "16px" }}>
							{t("payment.form.errorBanner")}
						</Alert>
					)}

					{/* STEP 2 — per-type fields */}
					{needsPartner && (
						<Stack sx={{ gap: "7px", mb: "16px" }}>
							<FormFieldLabel label={t("payment.form.partner")} required />
							<Controller
								name="partnerId"
								control={control}
								render={({ field }) => (
									<Select
										size="small"
										fullWidth
										displayEmpty
										MenuProps={DROPDOWN_MENU_PROPS}
										value={field.value ? String(field.value) : ""}
										error={!!fieldError("partnerId")}
										onChange={(e) => field.onChange(Number(e.target.value))}
										renderValue={(raw) => {
											const p = data.partners.find((x) => String(x.id) === raw);
											return p ? (
												p.name
											) : (
												<Box component="span" sx={{ color: "text.disabled" }}>
													{t("payment.form.partnerPlaceholder")}
												</Box>
											);
										}}
									>
										{data.partners.map((p) => (
											<MenuItem key={p.id} value={String(p.id)}>
												<Box
													sx={{
														display: "flex",
														width: "100%",
														justifyContent: "space-between",
														gap: 2,
													}}
												>
													<span>{p.name}</span>
													<Box component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
														{t(`payment.partnerType.${p.type}`)}
													</Box>
												</Box>
											</MenuItem>
										))}
									</Select>
								)}
							/>
							{fieldError("partnerId") && (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{fieldError("partnerId")}
								</Typography>
							)}
							{partner && (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: "6px",
										flexWrap: "wrap",
										mt: "2px",
										p: "8px 12px",
										borderRadius: "8px",
										bgcolor: designTokens.gray25,
										border: "1px solid",
										borderColor: "divider",
										fontSize: 12.5,
									}}
								>
									<Box component="span" sx={{ color: "text.secondary" }}>
										{t(`payment.partnerType.${partner.type}`)}
									</Box>
									<Box component="span" sx={{ color: designTokens.gray300 }}>
										·
									</Box>
									<Box component="span" sx={{ color: "text.secondary" }}>
										{t("payment.form.balance")}
									</Box>
									<Box
										component="span"
										sx={{
											...numericSx,
											fontWeight: 700,
											color: partner.balance >= 0 ? "success.main" : "error.main",
										}}
									>
										{formatCurrency(partner.balance)} UZS
									</Box>
									{(type === "Withdrawal" || partner.advance > 0) && (
										<>
											<Box component="span" sx={{ color: designTokens.gray300 }}>
												·
											</Box>
											<Box component="span" sx={{ color: "text.secondary" }}>
												{t("payment.form.advance")}
											</Box>
											<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
												{formatCurrency(partner.advance)} UZS
											</Box>
										</>
									)}
								</Box>
							)}
						</Stack>
					)}

					{type === "Payroll" && (
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", mb: "16px" }}>
							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("payment.form.employee")} required />
								<Controller
									name="employeeId"
									control={control}
									render={({ field }) => (
										<Select
											size="small"
											fullWidth
											displayEmpty
											MenuProps={DROPDOWN_MENU_PROPS}
											value={field.value ? String(field.value) : ""}
											error={!!fieldError("employeeId")}
											onChange={(e) => {
												const id = Number(e.target.value);
												field.onChange(id);
												const emp = data.employees.find((x) => x.id === id);
												if (emp) setValue("amount", emp.salary, { shouldDirty: true });
											}}
											renderValue={(raw) => {
												const emp = data.employees.find((x) => String(x.id) === raw);
												return emp ? (
													emp.name
												) : (
													<Box component="span" sx={{ color: "text.disabled" }}>
														{t("payment.form.employeePlaceholder")}
													</Box>
												);
											}}
										>
											{data.employees.map((emp) => (
												<MenuItem key={emp.id} value={String(emp.id)}>
													{emp.name}{" "}
													<Box
														component="span"
														sx={{ color: "text.disabled", fontSize: 12, ml: 1 }}
													>
														· {emp.position}
													</Box>
												</MenuItem>
											))}
										</Select>
									)}
								/>
								{fieldError("employeeId") && (
									<Typography sx={{ fontSize: 12, color: "error.main" }}>
										{fieldError("employeeId")}
									</Typography>
								)}
							</Stack>
							<Stack sx={{ gap: "7px" }}>
								<FormFieldLabel label={t("payment.form.period")} required />
								<Box sx={{ display: "flex", gap: "10px" }}>
									<Controller
										name="month"
										control={control}
										render={({ field }) => (
											<Select
												size="small"
												fullWidth
												value={field.value}
												onChange={(e) => field.onChange(e.target.value)}
											>
												{MONTHS.map((m) => (
													<MenuItem key={m} value={m}>
														{m}
													</MenuItem>
												))}
											</Select>
										)}
									/>
									<Controller
										name="year"
										control={control}
										render={({ field }) => (
											<Select
												size="small"
												sx={{ width: 110 }}
												value={field.value}
												onChange={(e) => field.onChange(e.target.value)}
											>
												{YEARS.map((y) => (
													<MenuItem key={y} value={y}>
														{y}
													</MenuItem>
												))}
											</Select>
										)}
									/>
								</Box>
							</Stack>
						</Box>
					)}

					{type === "General" && (
						<>
							<Stack sx={{ gap: "7px", mb: "16px" }}>
								<FormFieldLabel label={t("payment.form.directionLabel")} required />
								<Controller
									name="direction"
									control={control}
									render={({ field }) => (
										<DirectionChoice value={field.value} onChange={field.onChange} />
									)}
								/>
							</Stack>
							<Stack sx={{ gap: "7px", mb: "16px" }}>
								<FormFieldLabel label={t("payment.form.description")} required />
								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											size="small"
											fullWidth
											placeholder={t("payment.form.descriptionPlaceholder")}
											error={!!fieldError("description")}
											helperText={fieldError("description")}
										/>
									)}
								/>
							</Stack>
						</>
					)}

					{needsDirChoice && needsPartner && (
						<Stack sx={{ gap: "7px", mb: "16px" }}>
							<FormFieldLabel label={t("payment.form.directionBoth")} required />
							<Controller
								name="direction"
								control={control}
								render={({ field }) => (
									<DirectionChoice value={field.value} onChange={field.onChange} />
								)}
							/>
						</Stack>
					)}

					<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("payment.form.wallet")} required />
							<Controller
								name="walletId"
								control={control}
								render={({ field }) => (
									<Select
										size="small"
										fullWidth
										displayEmpty
										MenuProps={DROPDOWN_MENU_PROPS}
										value={field.value ? String(field.value) : ""}
										error={!!fieldError("walletId")}
										onChange={(e) => field.onChange(Number(e.target.value))}
										renderValue={(raw) => {
											const w = data.wallets.find((x) => String(x.id) === raw);
											return w ? (
												w.name
											) : (
												<Box component="span" sx={{ color: "text.disabled" }}>
													{t("payment.form.walletPlaceholder")}
												</Box>
											);
										}}
									>
										{data.wallets.map((w) => (
											<MenuItem key={w.id} value={String(w.id)}>
												{w.name}{" "}
												<Box component="span" sx={{ color: "text.disabled", fontSize: 12, ml: 1 }}>
													· {t(`wallet.type.${w.type.toLowerCase()}`)}
												</Box>
											</MenuItem>
										))}
									</Select>
								)}
							/>
							{fieldError("walletId") && (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{fieldError("walletId")}
								</Typography>
							)}
						</Stack>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("payment.form.amount")} required />
							<Controller
								name="amount"
								control={control}
								render={({ field }) => (
									<MoneyField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										size="small"
										placeholder="0"
										error={!!fieldError("amount") || overWithdraw}
										slotProps={{
											input: { endAdornment: <InputAdornment position="end">UZS</InputAdornment> },
										}}
									/>
								)}
							/>
							{overWithdraw ? (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{t("payment.form.overWithdraw", {
										advance: formatCurrency(partner?.advance ?? 0),
									})}
								</Typography>
							) : (
								fieldError("amount") && (
									<Typography sx={{ fontSize: 12, color: "error.main" }}>
										{fieldError("amount")}
									</Typography>
								)
							)}
						</Stack>
					</Box>

					{hasOpenDebts && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "9px",
								mt: "16px",
								p: "11px 14px",
								borderRadius: "8px",
								bgcolor: designTokens.infoBg,
								border: "1px solid",
								borderColor: designTokens.infoBorder,
								fontSize: 13,
								color: "info.main",
							}}
						>
							<BalanceOutlinedIcon sx={{ fontSize: 16, flex: "0 0 auto" }} />
							{t("payment.form.debtsBanner")}
						</Box>
					)}
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "14px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
					}}
				>
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							flex: 1,
							minWidth: 0,
							fontSize: 12,
							color: designTokens.saffron700,
						}}
					>
						<ReportProblemOutlinedIcon
							sx={{ fontSize: 15, color: "warning.main", flex: "0 0 auto" }}
						/>
						{t("payment.form.immutableWarn")}
					</Box>
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton
						icon={type === "Transaction" ? <BalanceOutlinedIcon /> : <CheckIcon />}
						onClick={submit}
						disabled={isSaving}
					>
						{type === "Transaction" ? t("payment.form.submitSettle") : t("payment.form.submit")}
					</PrimaryButton>
				</DialogActions>
			</Dialog>

			{settleOpen && partner && (
				<PaymentSettlementModal
					isOpen={settleOpen}
					isSaving={isSaving}
					partnerName={partner.name}
					amount={amount}
					walletName={data.wallets.find((w) => w.id === watch("walletId"))?.name ?? ""}
					direction={effectiveDir}
					outstanding={outstanding}
					onBack={() => setSettleOpen(false)}
					onConfirm={(settlements) => {
						setSettleOpen(false);
						onSave(buildRequest(settlements));
					}}
				/>
			)}

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

export default observer(PaymentCreateModal);
