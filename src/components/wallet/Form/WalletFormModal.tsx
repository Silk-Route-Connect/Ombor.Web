import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import UzsUnit from "components/shared/Money/UzsUnit";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { useWalletForm } from "hooks/wallet/useWalletForm";
import { observer } from "mobx-react-lite";
import { Wallet, WALLET_TYPES, WalletType } from "models/wallet";
import { WalletFormValues } from "schemas/WalletSchema";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Stack, TextField, Typography } from "@mui/material";

export interface WalletFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	wallet?: Wallet | null;
	onSave: (payload: WalletFormValues) => void;
	onClose: () => void;
}

/** Read-only locked field (bundle `.locked-field`) for immutable values on edit. */
const LockedField: React.FC<{ icon: React.ReactNode; value: React.ReactNode; tag: string }> = ({
	icon,
	value,
	tag,
}) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			px: "13px",
			minHeight: 40,
			border: "1px dashed",
			borderColor: designTokens.gray300,
			borderRadius: "8px",
			bgcolor: designTokens.gray25,
		}}
	>
		<Box sx={{ color: "text.disabled", display: "inline-flex" }}>{icon}</Box>
		<Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
			{value}
		</Box>
		<Box
			component="span"
			sx={{
				ml: "auto",
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				fontSize: 11,
				fontWeight: 600,
				color: "text.disabled",
			}}
		>
			<InfoOutlinedIcon sx={{ fontSize: 13 }} />
			{tag}
		</Box>
	</Box>
);

const WalletFormModal: React.FC<WalletFormModalProps> = ({
	isOpen,
	isSaving,
	wallet,
	onSave,
	onClose,
}) => {
	const { t } = useTranslation();
	const editing = Boolean(wallet);
	const { form, canSave, submit } = useWalletForm({ isOpen, isSaving, wallet, onSave });
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);
	const { control, formState } = form;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	return (
		<FormDialog
			open={isOpen}
			size="sm"
			title={editing ? t("wallet.form.editTitle") : t("wallet.form.createTitle")}
			subtitle={editing ? t("wallet.form.editSubtitle") : t("wallet.form.createSubtitle")}
			tile={recordTile("Wallet")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					onCancel={requestClose}
					onSave={submit}
					canSave={canSave}
					loading={isSaving}
					submitLabel={editing ? undefined : t("wallet.form.submitCreate")}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<FormField label={t("wallet.field.name")} required>
					<Controller
						name="name"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								autoFocus
								size="small"
								fullWidth
								placeholder={t("wallet.form.namePlaceholder")}
								disabled={isSaving}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>
				</FormField>

				<FormField label={t("wallet.field.type")}>
					{editing && wallet ? (
						<LockedField
							icon={(() => {
								const Icon = WALLET_TYPE_META[wallet.type].Icon;
								return <Icon sx={{ fontSize: 16 }} />;
							})()}
							value={t(WALLET_TYPE_META[wallet.type].labelKey)}
							tag={t("wallet.form.lockedType")}
						/>
					) : (
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<SegmentedControl<WalletType>
									variant="form"
									fullWidth
									value={field.value}
									onChange={field.onChange}
									disabled={isSaving}
									options={WALLET_TYPES.map((type) => {
										const { Icon, labelKey } = WALLET_TYPE_META[type];
										return { value: type, label: t(labelKey), icon: <Icon /> };
									})}
								/>
							)}
						/>
					)}
				</FormField>

				<FormField label={t("wallet.field.openingBalance")}>
					{editing && wallet ? (
						<LockedField
							icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
							value={
								<Box component="span" sx={numericSx}>
									{formatCurrency(wallet.openingBalance)}
									<UzsUnit />
								</Box>
							}
							tag={t("wallet.form.lockedOpening")}
						/>
					) : (
						<>
							<Controller
								name="openingBalance"
								control={control}
								render={({ field, fieldState }) => (
									<MoneyField
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										inputRef={field.ref}
										size="small"
										placeholder="0"
										disabled={isSaving}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										slotProps={{
											input: {
												endAdornment: <UzsAdornment />,
											},
										}}
									/>
								)}
							/>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								{t("wallet.form.openingHint")}
							</Typography>
						</>
					)}
				</FormField>
			</Stack>
		</FormDialog>
	);
};

export default observer(WalletFormModal);
