import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useWalletTransferForm } from "hooks/wallet/useWalletTransferForm";
import { observer } from "mobx-react-lite";
import { Wallet } from "models/wallet";
import { TransferFormValues } from "schemas/WalletSchema";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
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

export interface WalletTransferModalProps {
	isOpen: boolean;
	isSaving: boolean;
	/** Active (non-archived) wallets — the only valid transfer endpoints. */
	wallets: Wallet[];
	fromWalletId?: number;
	onSave: (payload: TransferFormValues) => void;
	onClose: () => void;
}

/** Wallet dropdown showing the icon + name + balance (bundle `.wpick`). */
const WalletPicker: React.FC<{
	value: number;
	wallets: Wallet[];
	excludeId: number;
	disabled: boolean;
	error?: boolean;
	onChange: (id: number) => void;
}> = ({ value, wallets, excludeId, disabled, error, onChange }) => (
	<Select
		size="small"
		fullWidth
		displayEmpty
		value={value ? String(value) : ""}
		disabled={disabled}
		error={error}
		onChange={(e) => onChange(Number(e.target.value))}
		renderValue={(raw) => {
			const wallet = wallets.find((w) => String(w.id) === raw);
			if (!wallet) {
				return (
					<Box component="span" sx={{ color: "text.disabled" }}>
						—
					</Box>
				);
			}
			return (
				<Box sx={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
					<WalletTypeAvatar type={wallet.type} size={26} iconSize={14} />
					<Box component="span" sx={{ flex: 1, fontSize: 14 }}>
						{wallet.name}
					</Box>
					<Box component="span" sx={{ ...numericSx, fontSize: 12.5, color: "text.disabled" }}>
						{formatCurrency(wallet.balance)} UZS
					</Box>
				</Box>
			);
		}}
	>
		{wallets.map((wallet) => (
			<MenuItem key={wallet.id} value={String(wallet.id)} disabled={wallet.id === excludeId}>
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
					<WalletTypeAvatar type={wallet.type} size={28} iconSize={15} />
					<Box component="span" sx={{ flex: 1 }}>
						{wallet.name}
					</Box>
					<Box component="span" sx={{ ...numericSx, fontSize: 12.5, color: "text.disabled" }}>
						{formatCurrency(wallet.balance)} UZS
					</Box>
				</Box>
			</MenuItem>
		))}
	</Select>
);

/** Compact route node for the live preview (from / to). */
const RouteNode: React.FC<{ label: string; wallet: Wallet | null }> = ({ label, wallet }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
		{wallet ? (
			<WalletTypeAvatar type={wallet.type} size={30} iconSize={16} />
		) : (
			<Box
				sx={{
					width: 30,
					height: 30,
					borderRadius: "8px",
					display: "grid",
					placeItems: "center",
					bgcolor: designTokens.gray100,
					color: designTokens.gray400,
				}}
			>
				<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
			</Box>
		)}
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: 11, color: "text.disabled" }}>{label}</Typography>
			<Typography sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
				{wallet?.name ?? "—"}
			</Typography>
		</Box>
	</Box>
);

const WalletTransferModal: React.FC<WalletTransferModalProps> = ({
	isOpen,
	isSaving,
	wallets,
	fromWalletId,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();

	const { form, canSave, submit } = useWalletTransferForm({
		isOpen,
		isSaving,
		wallets,
		fromWalletId,
		onSave: guardedSave,
	});
	const { control, formState, watch, setValue } = form;

	const fromId = watch("fromWalletId");
	const toId = watch("toWalletId");
	const amount = watch("amount");

	const fromWallet = wallets.find((w) => w.id === fromId) ?? null;
	const toWallet = wallets.find((w) => w.id === toId) ?? null;
	const available = fromWallet?.balance ?? 0;
	const over = !!fromWallet && amount > available;

	// Over-balance is contextual (depends on the live source balance) — block
	// here, then defer to the store.
	function guardedSave(values: TransferFormValues) {
		const source = wallets.find((w) => w.id === values.fromWalletId);
		if (source && values.amount > source.balance) {
			return;
		}
		onSave(values);
	}

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	const showBanner = over || (formState.isSubmitted && Object.keys(formState.errors).length > 0);

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 560, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t("wallet.transfer.title")}
					subtitle={t("wallet.transfer.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{/* live route preview */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							p: "14px 16px",
							mb: "18px",
							bgcolor: designTokens.gray25,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
						}}
					>
						<RouteNode label={t("wallet.transfer.from")} wallet={fromWallet} />
						<ChevronRightIcon sx={{ fontSize: 18, color: "primary.main", flex: "0 0 auto" }} />
						<RouteNode label={t("wallet.transfer.to")} wallet={toWallet} />
						<Typography
							sx={{
								ml: "auto",
								...numericSx,
								fontWeight: 800,
								fontSize: 19,
								letterSpacing: "-0.02em",
								color: amount > 0 && !over ? "text.primary" : "text.disabled",
								flex: "0 0 auto",
							}}
						>
							{formatCurrency(amount > 0 ? amount : 0)}{" "}
							<Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled" }}>
								UZS
							</Box>
						</Typography>
					</Box>

					{showBanner && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "16px" }}
						>
							{t("wallet.transfer.errorBanner")}
						</Alert>
					)}

					<Stack sx={{ gap: "16px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.transfer.from")} required />
							<Controller
								name="fromWalletId"
								control={control}
								render={({ field, fieldState }) => (
									<WalletPicker
										value={field.value}
										wallets={wallets}
										excludeId={toId}
										disabled={isSaving}
										error={!!fieldState.error}
										onChange={field.onChange}
									/>
								)}
							/>
							{fromWallet && (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: "7px",
										mt: "1px",
										fontSize: 12.5,
										color: "text.secondary",
									}}
								>
									<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
									{t("wallet.transfer.available")}{" "}
									<Box component="b" sx={{ ...numericSx, fontWeight: 700, color: "text.primary" }}>
										{formatCurrency(available)} UZS
									</Box>
									<Box
										component="span"
										onClick={() =>
											setValue("amount", available, { shouldDirty: true, shouldValidate: true })
										}
										sx={{
											ml: "4px",
											color: "primary.main",
											fontWeight: 600,
											cursor: "pointer",
											"&:hover": { textDecoration: "underline" },
										}}
									>
										{t("wallet.transfer.transferAll")}
									</Box>
								</Box>
							)}
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.transfer.to")} required />
							<Controller
								name="toWalletId"
								control={control}
								render={({ field, fieldState }) => (
									<WalletPicker
										value={field.value}
										wallets={wallets}
										excludeId={fromId}
										disabled={isSaving}
										error={!!fieldState.error}
										onChange={field.onChange}
									/>
								)}
							/>
							{formState.errors.toWalletId && (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{formState.errors.toWalletId.message}
								</Typography>
							)}
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.transfer.amount")} required />
							<Controller
								name="amount"
								control={control}
								render={({ field, fieldState }) => (
									<NumericField
										{...field}
										value={field.value || ""}
										size="small"
										min={0}
										placeholder="0"
										disabled={isSaving}
										error={!!fieldState.error || over}
										onChange={(e) =>
											field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
										}
										slotProps={{
											input: { endAdornment: <InputAdornment position="end">UZS</InputAdornment> },
										}}
									/>
								)}
							/>
							{over ? (
								<Typography sx={{ fontSize: 12, color: "error.main" }}>
									{t("wallet.transfer.overBalance", { available: formatCurrency(available) })}
								</Typography>
							) : (
								formState.errors.amount && (
									<Typography sx={{ fontSize: 12, color: "error.main" }}>
										{formState.errors.amount.message}
									</Typography>
								)
							)}
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.transfer.note")} />
							<Controller
								name="note"
								control={control}
								render={({ field, fieldState }) => (
									<TextField
										{...field}
										value={field.value ?? ""}
										size="small"
										fullWidth
										placeholder={t("wallet.transfer.notePlaceholder")}
										disabled={isSaving}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
									/>
								)}
							/>
						</Stack>
					</Stack>
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
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "7px",
							fontSize: 12.5,
							color: designTokens.saffron700,
						}}
					>
						<InfoOutlinedIcon sx={{ fontSize: 15, color: "warning.main" }} />
						{t("wallet.transfer.immutableHint")}
					</Box>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<SwapHorizIcon />} onClick={submit} disabled={!canSave}>
						{t("wallet.transfer.submit")}
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

export default observer(WalletTransferModal);
