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
	Switch,
	TextField,
} from "@mui/material";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";

export type EmployeeFormPayload = {
	fullName: string;
	role: string;
	isActive: boolean;
};

export interface EmployeeFormModalProps {
	isOpen: boolean;
	employee: Employee | null;
	onClose: () => void;
	onSave: (payload: EmployeeFormPayload) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
	isOpen,
	employee,
	onClose,
	onSave,
}) => {
	const {
		register,
		control,
		reset,
		handleSubmit,
		formState: { errors },
	} = useForm<EmployeeFormPayload>({
		defaultValues: {
			fullName: "",
			role: "",
			isActive: true,
		},
	});

	useEffect(() => {
		if (!isOpen) return;
		if (employee) {
			reset({
				fullName: employee.fullName,
				role: employee.role,
				isActive: employee.isActive,
			});
		} else {
			reset({
				fullName: "",
				role: "",
				isActive: true,
			});
		}
	}, [isOpen, employee, reset]);

	const dialogTitle = employee
		? translate("employee.updateTitle")
		: translate("employee.createTitle");

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

			<form>
				<DialogContent dividers>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("employee.fullName")}
								fullWidth
								margin="dense"
								{...register("fullName", {
									required: translate("employee.fullNameRequired"),
								})}
								error={!!errors.fullName}
								helperText={errors.fullName?.message}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<TextField
								label={translate("employee.role")}
								fullWidth
								margin="dense"
								{...register("role")}
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
						{employee ? translate("update") : translate("create")}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EmployeeFormModal;
