import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { ProductFormInputs } from "schemas/ProductSchema";
import { designTokens } from "theme";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
	Box,
	Collapse,
	FormControlLabel,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";

export interface ProductFormPackagingProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
	hasPackaging: boolean;
	packPrice: number | null;
	enablePackaging: () => void;
	disablePackaging: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

/** Bundle `.switch`: 42×24 pill, gray-300 track (primary when on), 20px knob. */
const switchSx = {
	width: 42,
	height: 24,
	p: 0,
	"& .MuiSwitch-switchBase": {
		p: "2px",
		"&.Mui-checked": {
			transform: "translateX(18px)",
			color: "#fff",
			"& + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 1 },
		},
	},
	"& .MuiSwitch-thumb": {
		width: 20,
		height: 20,
		bgcolor: "#fff",
		boxShadow: (theme: { shadows: string[] }) => theme.shadows[1],
	},
	"& .MuiSwitch-track": { borderRadius: 999, bgcolor: designTokens.gray300, opacity: 1 },
} as const;

/** Label-above-input row per the bundle's `.frow` (7px gap). */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Stack sx={{ gap: "7px" }}>
		<FormFieldLabel label={label} />
		{children}
	</Stack>
);

/**
 * «Фасовка» per the bundle: pack-head title (box icon + 14px/700 text) with
 * the 42×24 switch on the right; when enabled, the fields sit in a tinted
 * bordered card (surface-sub, r-md, 16px padding, two-column 14px grid).
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
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<Box sx={{ display: "inline-flex", alignItems: "center", gap: "9px" }}>
					<Inventory2OutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
					<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("product.packaging")}</Typography>
				</Box>

				<FormControlLabel
					label={t("common.enable")}
					labelPlacement="start"
					sx={{ mr: 0, gap: "10px", "& .MuiFormControlLabel-label": { fontSize: 13.5 } }}
					control={
						<Switch
							sx={switchSx}
							checked={hasPackaging}
							onChange={(_, checked) => (checked ? enablePackaging() : disablePackaging())}
							disabled={disabled}
						/>
					}
				/>
			</Box>

			<Collapse in={hasPackaging} unmountOnExit>
				<Box
					sx={{
						mt: "14px",
						p: "16px",
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
						bgcolor: designTokens.gray25,
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
						gap: "14px",
					}}
				>
					<Field label={t("product.packaging.size")}>
						<Controller
							name="packaging.size"
							control={control}
							render={({ field, fieldState }) => (
								<NumericField
									{...field}
									value={field.value}
									size="small"
									min={2}
									step={1}
									selectOnFocus
									disabled={disabled}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
								/>
							)}
						/>
					</Field>

					<Field label={t("product.packaging.label")}>
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
					</Field>

					<Field label={t("product.packaging.barcode")}>
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
					</Field>

					<Field label={t("product.packaging.price")}>
						<TextField
							value={packPrice ?? "0"}
							size="small"
							fullWidth
							aria-readonly
							slotProps={{ input: { readOnly: true } }}
						/>
					</Field>
				</Box>
			</Collapse>
		</Box>
	);
};

export default ProductFormPackaging;
