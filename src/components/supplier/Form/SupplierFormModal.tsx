// src/components/supplier/Form/SupplierFormModal.tsx
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	IconButton,
	Switch,
	TextField,
} from "@mui/material";
import PhoneListInput from "components/shared/Inputs/PhoneListField";
import { translate } from "i18n/i18n";
import { Supplier } from "models/supplier";

export type SupplierFormPayload = {
	name: string;
	companyName?: string;
	address?: string;
	email?: string;
	phoneNumbers: string[];
	isActive: boolean;
};

export interface SupplierFormModalProps {
	isOpen: boolean;
	supplier?: Supplier | null;
	onClose: () => void;
	onSave: (payload: SupplierFormPayload) => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
	isOpen,
	supplier,
	onClose,
	onSave,
}) => {
	const {
		register,
		control,
		reset,
		handleSubmit,
		formState: { errors },
	} = useForm<SupplierFormPayload>({
		defaultValues: {
			name: "",
			companyName: "",
			address: "",
			email: "",
			phoneNumbers: [""],
			isActive: true,
		},
	});

	useEffect(() => {
		if (!isOpen) return;
		if (supplier) {
			reset({
				name: supplier.name,
				companyName: supplier.companyName ?? "",
				address: supplier.address ?? "",
				email: supplier.email ?? "",
				phoneNumbers: supplier.phoneNumbers.length ? supplier.phoneNumbers : [""],
				isActive: supplier.isActive,
			});
		} else {
			reset({
				name: "",
				companyName: "",
				address: "",
				email: "",
				phoneNumbers: [""],
				isActive: true,
			});
		}
	}, [isOpen, supplier, reset]);

	const onSubmit = (data: SupplierFormPayload) => {
		const cleanedPhones = data.phoneNumbers.filter((p) => p.trim() !== "");
		onSave({ ...data, phoneNumbers: cleanedPhones });
	};

	const dialogTitle = supplier ? translate("editSupplier") : translate("createSupplier");

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
					<Grid container spacing={4}>
						{/* Row 1: Name | Company Name */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("fieldName")}
								fullWidth
								{...register("name", {
									required: translate("fieldNameRequired"),
								})}
								error={!!errors.name}
								helperText={errors.name?.message}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("fieldCompanyName")}
								fullWidth
								{...register("companyName")}
							/>
						</Grid>

						{/* Row 2: Address | Email */}
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField label={translate("fieldAddress")} fullWidth {...register("address")} />
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("fieldEmail")}
								type="email"
								fullWidth
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

						{/* Row 3: Phone Numbers */}
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

						{/* Row 4: Active Switch */}
						<Grid size={{ xs: 12 }}>
							<Controller
								name="isActive"
								control={control}
								defaultValue={true}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Switch
												{...field}
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
												color="primary"
											/>
										}
										label={translate("fieldIsActive")}
									/>
								)}
							/>
						</Grid>
					</Grid>
				</DialogContent>

				<DialogActions>
					<Button onClick={onClose}>{translate("cancel")}</Button>
					<Button type="submit" variant="contained" color="primary">
						{supplier ? translate("update") : translate("create")}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default SupplierFormModal;
