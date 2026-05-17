import React from "react";
import { UseWarehouseFormResult } from "hooks/warehouse/useWarehouseForm";
import { translate } from "i18n/i18n";

import { Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";

interface WarehouseFormFieldsProps {
	form: UseWarehouseFormResult;
}

const WarehouseFormFields: React.FC<WarehouseFormFieldsProps> = ({ form }) => {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = form.form;

	const isActive = watch("isActive");

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
				<FormControlLabel
					control={
						<Checkbox
							checked={isActive}
							onChange={(e) =>
								setValue("isActive", e.target.checked, {
									shouldDirty: true,
									shouldValidate: true,
								})
							}
						/>
					}
					label={translate("warehouse.field.isActive")}
				/>
			</Grid>
		</Grid>
	);
};

export default WarehouseFormFields;
