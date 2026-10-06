import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { recordTile } from "components/shared/IconTile/recordTile";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import UzsUnit from "components/shared/Money/UzsUnit";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useWalletTransferForm } from "hooks/wallet/useWalletTransferForm";
import { observer } from "mobx-react-lite";
import { Wallet } from "models/wallet";
import { TransferFormValues } from "schemas/WalletSchema";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Stack, TextField, Typography } from "@mui/material";

import WalletPicker from "./WalletPicker";

export interface WalletTransferModalProps {
	isOpen: boolean;
	isSaving: boolean;
	/** Active (non-archived) wallets — the only valid transfer endpoints. */
	wallets: Wallet[];
	fromWalletId?: number;
	onSave: (payload: TransferFormValues) => void;
	onClose: () => void;
}

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
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });

	const fromId = watch("fromWalletId");
	const toId = watch("toWalletId");
	const amount = watch("amount");

	const fromWallet = wallets.find((w) => w.id === fromId) ?? null;
	// Clamp to ≥ 0 so an overdrawn (negative-balance) source doesn't block every
	// transfer — a negative «available» would make any positive amount over-balance (F13).
	const available = Math.max(fromWallet?.balance ?? 0, 0);
	const over = !!fromWallet && amount > available;

	// Over-balance is contextual (depends on the live source balance) — block
	// here, then defer to the store.
	function guardedSave(values: TransferFormValues) {
		const source = wallets.find((w) => w.id === values.fromWalletId);
		if (source && values.amount > Math.max(source.balance, 0)) {
			return;
		}
		onSave(values);
	}

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	return (
		<FormDialog
			open={isOpen}
			size="md"
			title={t("wallet.transfer.title")}
			subtitle={t("wallet.transfer.subtitle")}
			tile={recordTile("WalletTransfer")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					canSave={canSave}
					loading={isSaving}
					onCancel={requestClose}
					onSave={submit}
					submitLabel={t("wallet.transfer.submit")}
					submitIcon={<SwapHorizIcon />}
					commitNote={t("wallet.transfer.commitNote")}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				{/* Source → destination on one row (WAL-17). */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "1fr 36px 1fr",
						gap: "10px",
						alignItems: "end",
					}}
				>
					<FormField label={t("wallet.transfer.from")} required>
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
					</FormField>
					<Box sx={{ height: 38, display: "grid", placeItems: "center", color: "primary.main" }}>
						<ChevronRightIcon sx={{ fontSize: 20 }} />
					</Box>
					<FormField label={t("wallet.transfer.to")} required>
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
					</FormField>
				</Box>
				{formState.errors.toWalletId && (
					<Typography sx={{ fontSize: 12, color: "error.main", mt: "-8px" }}>
						{formState.errors.toWalletId.message}
					</Typography>
				)}

				<Stack sx={{ gap: "6px" }}>
					<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<FormFieldLabel label={t("wallet.transfer.amount")} required />
						{fromWallet && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "5px",
									fontSize: 13,
									color: "text.secondary",
								}}
							>
								<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
								{t("wallet.transfer.available")}{" "}
								<Box component="b" sx={{ ...numericSx, fontWeight: 700, color: "text.primary" }}>
									{formatCurrency(available)}
									<UzsUnit />
								</Box>
							</Box>
						)}
					</Box>
					{/* «Перевести всё» sits beside the amount input (WAL-18). */}
					<Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Controller
								name="amount"
								control={control}
								render={({ field, fieldState }) => (
									<MoneyField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										size="small"
										fullWidth
										placeholder="0"
										disabled={isSaving}
										error={!!fieldState.error || over}
										helperText={
											over
												? t("wallet.transfer.overBalance", {
														available: formatCurrency(available),
													})
												: fieldState.error?.message
										}
										slotProps={{
											input: {
												endAdornment: <UzsAdornment />,
											},
										}}
									/>
								)}
							/>
						</Box>
						{fromWallet && (
							<GhostButton
								disabled={isSaving}
								onClick={() =>
									setValue("amount", available, { shouldDirty: true, shouldValidate: true })
								}
							>
								{t("wallet.transfer.transferAll")}
							</GhostButton>
						)}
					</Box>
				</Stack>

				<FormField label={t("wallet.transfer.note")}>
					<Controller
						name="note"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								value={field.value ?? ""}
								size="small"
								fullWidth
								multiline
								minRows={2}
								placeholder={t("wallet.transfer.notePlaceholder")}
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

export default observer(WalletTransferModal);
