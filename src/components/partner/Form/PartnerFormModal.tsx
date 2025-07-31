import React from "react";
import { Controller, FieldError } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	Switch,
	TextField,
	Tooltip,
} from "@mui/material";
import PhoneListField from "components/shared/Inputs/PhoneListField";
import { PartnerFormPayload, usePartnerForm } from "hooks/partner/usePartnerForm";
import { translate } from "i18n/i18n";
import { Partner, PartnerType } from "models/partner";

const PARTNER_TYPES: PartnerType[] = ["Customer", "Supplier", "Both"];

export interface PartnerFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	onClose: () => void;
	onSave: (payload: PartnerFormPayload) => void;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
	isOpen,
	isSaving,
	partner,
	onClose,
	onSave,
}) => {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isDirty, isValid },
	} = usePartnerForm(isOpen, partner);

	const submit = handleSubmit((data) => {
		const payload: PartnerFormPayload = {
			...data,
			phoneNumbers: data.phoneNumbers ?? [], // default if undefined
		};
		onSave(payload);
	});

	const safeClose = () => {
		if (isSaving) return;
		if (isDirty && !window.confirm(translate("common.confirmDiscardChanges"))) return;
		onClose();
	};

	const dialogTitle = partner ? translate("partner.title.edit") : translate("partner.title.create");
	const canSave = isDirty && isValid && !isSaving;

	return (
		<Dialog
			open={isOpen}
			onClose={safeClose}
			fullWidth
			maxWidth="md"
			disableEscapeKeyDown={isSaving}
			disableRestoreFocus
		>
			<DialogTitle sx={{ m: 0, p: 2 }}>
				{dialogTitle}
				<IconButton
					aria-label={translate("close")}
					onClick={safeClose}
					disabled={isSaving}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{isSaving && <LinearProgress />}

			<DialogContent dividers>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={`${translate("partner.name")}*`}
							fullWidth
							margin="dense"
							disabled={isSaving}
							error={!!errors.name}
							helperText={errors.name?.message}
							{...register("name")}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<FormControl fullWidth margin="dense" error={!!errors.type}>
							<InputLabel id="partner-type-label">{translate("partner.type")}</InputLabel>
							<Controller
								name="type"
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										labelId="partner-type-label"
										label={translate("partner.type")}
										disabled={isSaving}
										error={!!errors.type}
									>
										{PARTNER_TYPES.map((t) => (
											<MenuItem key={t} value={t}>
												{translate(`partner.type.${t}`)}
											</MenuItem>
										))}
									</Select>
								)}
							/>
							{errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
						</FormControl>
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("partner.company")}
							fullWidth
							disabled={isSaving}
							error={!!errors.companyName}
							helperText={errors.companyName?.message}
							{...register("companyName")}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 6 }}>
						<TextField
							label={translate("partner.address")}
							fullWidth
							disabled={isSaving}
							error={!!errors.address}
							helperText={errors.address?.message}
							{...register("address")}
						/>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<TextField
							label={translate("partner.email")}
							type="email"
							fullWidth
							disabled={isSaving}
							error={!!errors.email}
							helperText={errors.email?.message}
							{...register("email")}
						/>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<Controller
							name="phoneNumbers"
							control={control}
							render={({ field }) => {
								const phoneErrors = Array.isArray(errors.phoneNumbers)
									? (errors.phoneNumbers as (FieldError | undefined)[])
									: [];
								return (
									<PhoneListField
										values={field.value ?? []}
										onChange={field.onChange}
										errors={phoneErrors}
										onBlur={field.onBlur}
									/>
								);
							}}
						/>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<FormControlLabel
							control={
								<Controller
									name="isActive"
									control={control}
									render={({ field }) => (
										<Switch {...field} checked={field.value} color="primary" disabled={isSaving} />
									)}
								/>
							}
							label={translate("fieldIsActive")}
						/>
					</Grid>
				</Grid>
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={safeClose} disabled={isSaving}>
					{translate("common.cancel")}
				</Button>
				<Tooltip title={translate("common.form.completeRequired")} placement="top">
					<span>
						<Button variant="contained" loading={isSaving} onClick={submit} disabled={!canSave}>
							{translate("common.save")}
						</Button>
					</span>
				</Tooltip>
			</DialogActions>
		</Dialog>
	);
};

export default PartnerFormModal;
