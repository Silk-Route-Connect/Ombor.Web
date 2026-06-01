import React from "react";
import { UseWarehouseFormResult } from "hooks/warehouse/useWarehouseForm";
import { translate } from "i18n/i18n";

import { Grid, TextField } from "@mui/material";

interface WarehouseFormFieldsProps {
	form: UseWarehouseFormResult;
}

const WarehouseFormFields: React.FC<WarehouseFormFieldsProps> = ({ form }) => {
	const {
		register,
		formState: { errors },
	} = form.form;

	return (
		<Grid container rowSpacing={2} columnSpacing={2}>
			<Grid size={{ xs: 12 }}>
				<TextField
					label={translate("warehouse.field.name")}
					{...register("name")}
					error={!!errors.name}
					helperText={errors.name?.message}
					fullWidth
					required
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					label={translate("warehouse.field.location")}
					{...register("location")}
					error={!!errors.location}
					helperText={errors.location?.message}
					fullWidth
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					label={translate("warehouse.field.notes")}
					placeholder={translate("warehouse.field.notesPlaceholder")}
					{...register("notes")}
					error={!!errors.notes}
					helperText={errors.notes?.message}
					fullWidth
					multiline
					minRows={3}
				/>
			</Grid>
		</Grid>
	);
};

export default WarehouseFormFields;
