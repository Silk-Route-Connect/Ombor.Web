import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useWalletForm } from "hooks/wallet/useWalletForm";
import { observer } from "mobx-react-lite";
import { Wallet, WALLET_TYPES, WalletType } from "models/wallet";
import { WalletFormValues } from "schemas/WalletSchema";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
	Box,
	ButtonBase,
	Dialog,
	DialogContent,
	InputAdornment,
	LinearProgress,
	Stack,
	TextField,
	Typography,
} from "@mui/material";

export interface WalletFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	wallet?: Wallet | null;
	onSave: (payload: WalletFormValues) => void;
	onClose: () => void;
}

/** Full-width type segmented control with an icon per option (bundle `.seg-type`). */
const TypeSelector: React.FC<{
	value: WalletType;
	disabled: boolean;
	onChange: (type: WalletType) => void;
}> = ({ value, disabled, onChange }) => {
	const { t } = useTranslation();
	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				bgcolor: designTokens.gray100,
				borderRadius: "8px",
				p: "3px",
				gap: "2px",
			}}
		>
			{WALLET_TYPES.map((type) => {
				const meta = WALLET_TYPE_META[type];
				const Icon = meta.Icon;
				const selected = type === value;
				return (
					<ButtonBase
						key={type}
						disabled={disabled}
						onClick={() => onChange(type)}
						sx={{
							flex: 1,
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "7px",
							py: "9px",
							fontSize: 13,
							fontWeight: selected ? 600 : 500,
							fontFamily: "inherit",
							color: selected ? "text.primary" : "text.secondary",
							borderRadius: "6px",
							bgcolor: selected ? "background.paper" : "transparent",
							boxShadow: selected ? 1 : "none",
						}}
					>
						<Icon sx={{ fontSize: 16 }} />
						{t(meta.labelKey)}
					</ButtonBase>
				);
			})}
		</Box>
	);
};

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
	const { control, formState } = form;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

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
					title={editing ? t("wallet.form.editTitle") : t("wallet.form.createTitle")}
					subtitle={editing ? t("wallet.form.editSubtitle") : t("wallet.form.createSubtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					<Stack sx={{ gap: "16px" }}>
						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.field.name")} required />
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
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.field.type")} />
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
										<TypeSelector
											value={field.value}
											disabled={isSaving}
											onChange={field.onChange}
										/>
									)}
								/>
							)}
						</Stack>

						<Stack sx={{ gap: "7px" }}>
							<FormFieldLabel label={t("wallet.field.openingBalance")} />
							{editing && wallet ? (
								<LockedField
									icon={<InfoOutlinedIcon sx={{ fontSize: 15 }} />}
									value={
										<Box component="span" sx={numericSx}>
											{formatCurrency(wallet.openingBalance)} UZS
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
														endAdornment: <InputAdornment position="end">UZS</InputAdornment>,
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

export default observer(WalletFormModal);
