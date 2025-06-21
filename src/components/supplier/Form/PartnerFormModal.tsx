import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	Grid,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
} from "@mui/material";
import PhoneListInput from "components/shared/Inputs/PhoneListField";
import { translate } from "i18n/i18n";
import { Partner, PartnerType } from "models/partner";

export type PartnerFormPayload = {
	name: string;
	companyName?: string;
	address?: string;
	email?: string;
	phoneNumbers: string[];
	type: PartnerType;
	isActive: boolean;
};

const PARTNER_TYPES: PartnerType[] = ["All", "Customer", "Supplier"];

export interface PartnerFormModalProps {
	isOpen: boolean;
	partner?: Partner | null;
	onClose: () => void;
	onSave: (payload: PartnerFormPayload) => void;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({
	isOpen,
	partner,
	onClose,
	onSave,
}) => {
	const {
		register,
		control,
		reset,
		handleSubmit,
		formState: { errors },
	} = useForm<PartnerFormPayload>({
		defaultValues: {
			name: "",
			companyName: "",
			address: "",
			email: "",
			phoneNumbers: [""],
			type: "All",
			isActive: true,
		},
	});

	useEffect(() => {
		if (!isOpen) return;
		if (partner) {
			reset({
				name: partner.name,
				companyName: partner.companyName ?? "",
				address: partner.address ?? "",
				email: partner.email ?? "",
				phoneNumbers: partner.phoneNumbers.length > 0 ? partner.phoneNumbers : [""],
				type: partner.type,
			});
		} else {
			reset({
				name: "",
				companyName: "",
				address: "",
				email: "",
				phoneNumbers: [""],
				type: "All",
				isActive: true,
			});
		}
	}, [isOpen, partner, reset]);

	const onSubmit = (data: PartnerFormPayload) => {
		const cleanedPhones = data.phoneNumbers.filter((p) => p.trim() !== "");
		onSave({ ...data, phoneNumbers: cleanedPhones });
	};

	const dialogTitle = partner ? translate("partner.updateTitle") : translate("partner.createTitle");

	return (
		<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle sx={{ m: 0, p: 2 }}>
				{dialogTitle}
				<IconButton
					aria-label={translate("close")}
					onClick={onClose}
					sx={{ position: "absolute", right: 8, top: 8 }}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent dividers>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("partner.name")}
								fullWidth
								margin="dense"
								{...register("name", {
									required: translate("partner.nameRequired"),
								})}
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<FormControl fullWidth margin="dense">
								<InputLabel id="partner-type-label">{translate("partner.type")}</InputLabel>
								<Controller
									name="type"
									control={control}
									render={({ field }) => (
										<Select
											{...field}
											labelId="partner-type-label"
											label={translate("partner.type")}
										>
											{PARTNER_TYPES.map((t) => (
												<MenuItem key={t} value={t}>
													{translate(`partner.type.${t}`)}
												</MenuItem>
											))}
										</Select>
									)}
								/>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("partner.company")}
								fullWidth
								margin="dense"
								{...register("companyName")}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("fieldAddress")}
								fullWidth
								margin="dense"
								{...register("address")}
							/>
						</Grid>
						<Grid size={{ xs: 12 }}>
							<TextField
								label={translate("fieldEmail")}
								type="email"
								fullWidth
								margin="dense"
								{...register("email", {
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: translate("invalidEmail"),
									},
								})}
								error={!!errors.email}
								helperText={errors.email?.message}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<Controller
								name="phoneNumbers"
								control={control}
								defaultValue={[""]}
								render={({ field }) => (
									<PhoneListInput values={field.value} onChange={field.onChange} />
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<FormControlLabel
								control={
									<Controller
										name="isActive"
										control={control}
										render={({ field }) => (
											<Switch {...field} checked={field.value} color="primary" />
										)}
									/>
								}
								label={translate("fieldIsActive")}
							/>
						</Grid>
					</Grid>
				</DialogContent>

				<DialogActions>
					<Button onClick={onClose}>{translate("cancel")}</Button>
					<Button type="submit" variant="contained" color="primary">
						{partner ? translate("update") : translate("create")}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default PartnerFormModal;
