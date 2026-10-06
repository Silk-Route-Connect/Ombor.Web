import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import FormSection from "components/shared/Forms/FormSection";
import NumericField from "components/shared/Inputs/NumericField";
import { ProductFormInputs } from "schemas/ProductSchema";
import { designTokens, radius } from "theme";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Collapse, FormControlLabel, Switch, TextField } from "@mui/material";

export interface ProductFormPackagingProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
	hasPackaging: boolean;
	packPrice: number | null;
	enablePackaging: () => void;
	disablePackaging: () => void;
}

/** Bundle `.switch`: 42×24 pill, gray-300 track (primary when on), 20px knob. */
const switchSx = {
	width: 42,
	height: 24,
	p: 0,
	"& .MuiSwitch-switchBase": {
		p: "2px",
		"&.Mui-checked": {
			transform: "translateX(18px)",
			color: "common.white",
			"& + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 1 },
		},
	},
	"& .MuiSwitch-thumb": {
		width: 20,
		height: 20,
		bgcolor: "common.white",
		boxShadow: (theme: { shadows: string[] }) => theme.shadows[1],
	},
	"& .MuiSwitch-track": {
		borderRadius: `${radius.pill}px`,
		bgcolor: designTokens.gray300,
		opacity: 1,
	},
} as const;

/**
 * «Фасовка»: a `FormSection` heading with the 42×24 switch on the right; when
 * enabled, the fields sit in a tinted bordered card (surface-sub, r-md, 16px
 * padding, two-column 14px grid).
 */
const ProductFormPackaging: React.FC<ProductFormPackagingProps> = ({
	control,
	disabled,
	hasPackaging,
	packPrice,
	enablePackaging,
	disablePackaging,
}) => {
	const { t } = useTranslation();

	return (
		<Box>
			<FormSection
				title={t("product.packaging")}
				icon={<Inventory2OutlinedIcon />}
				action={
					<FormControlLabel
						label={t("common.enable")}
						labelPlacement="start"
						sx={{ mr: 0, gap: "10px", "& .MuiFormControlLabel-label": { fontSize: 13 } }}
						control={
							<Switch
								sx={switchSx}
								checked={hasPackaging}
								onChange={(_, checked) => (checked ? enablePackaging() : disablePackaging())}
								disabled={disabled}
							/>
						}
					/>
				}
			/>

			<Collapse in={hasPackaging} unmountOnExit>
				<Box
					sx={{
						mt: "14px",
						p: "16px",
						border: "1px solid",
						borderColor: "divider",
						borderRadius: `${radius.md}px`,
						bgcolor: designTokens.gray25,
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
						gap: "14px",
					}}
				>
					<FormField label={t("product.packaging.size")}>
						<Controller
							name="packaging.size"
							control={control}
							render={({ field, fieldState }) => (
								<NumericField
									{...field}
									size="small"
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</FormField>

					<FormField label={t("product.packaging.label")}>
						<Controller
							name="packaging.label"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									value={field.value ?? ""}
									size="small"
									fullWidth
									placeholder={t("product.form.packLabelPlaceholder")}
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</FormField>

					<FormField label={t("product.packaging.barcode")}>
						<Controller
							name="packaging.barcode"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									value={field.value ?? ""}
									size="small"
									fullWidth
									placeholder={t("product.form.optionalPlaceholder")}
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</FormField>

					<FormField label={t("product.packaging.price")}>
						<TextField
							value={packPrice ?? "0"}
							size="small"
							fullWidth
							aria-readonly
							slotProps={{ input: { readOnly: true } }}
						/>
					</FormField>
				</Box>
			</Collapse>
		</Box>
	);
};

export default ProductFormPackaging;
