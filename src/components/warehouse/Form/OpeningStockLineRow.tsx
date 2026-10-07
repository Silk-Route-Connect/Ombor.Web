import React from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import MoneyField from "components/shared/Inputs/MoneyField";
import NumericField from "components/shared/Inputs/NumericField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import ThresholdField from "components/warehouse/Stock/ThresholdField";
import { Measurement, Product } from "models/product";
import { OpeningStockFormInputs } from "schemas/WarehouseSchema";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, InputAdornment, Typography } from "@mui/material";

/**
 * Product · quantity · threshold · unit cost · line value · remove — the header
 * captions share it. The cost column holds a nine-figure cost at the money-input
 * weight beside «UZS»; product names keep ~270px of the 880px modal.
 */
export const OPENING_LINE_GRID = "1fr 96px 96px 160px 120px 38px";

interface OpeningStockLineRowProps {
	index: number;
	control: Control<OpeningStockFormInputs>;
	setValue: UseFormSetValue<OpeningStockFormInputs>;
	product: Product | null;
	options: Product[];
	unit: string;
	/** The picked product's unit — the threshold takes a fraction for weight units. */
	measurement: Measurement;
	/** The line's unit cost already entered (a picked product prefills only an empty one). */
	unitCost: number;
	/** quantity × unit cost of a complete line, else 0 (draft display). */
	lineValue: number;
	errorMessage?: string;
	/** The only line cannot be removed. */
	onlyLine: boolean;
	disabled: boolean;
	onRemove: () => void;
}

/** One opening-stock line; its first error shows under the row. */
const OpeningStockLineRow: React.FC<OpeningStockLineRowProps> = ({
	index,
	control,
	setValue,
	product,
	options,
	unit,
	measurement,
	unitCost,
	lineValue,
	errorMessage,
	onlyLine,
	disabled,
	onRemove,
}) => {
	const { t } = useTranslation();

	return (
		<Box>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: OPENING_LINE_GRID,
					gap: "10px",
					alignItems: "center",
				}}
			>
				<Controller
					name={`items.${index}.productId` as const}
					control={control}
					render={({ field, fieldState }) => (
						<EntityAutocomplete<Product>
							placeholder={t("warehouse.opening.productPlaceholder")}
							size="small"
							options={options}
							value={product}
							error={!!fieldState.error}
							additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
							onChange={(p) => {
								field.onChange(p?.id ?? 0);
								// Prefill the unit cost from the product's supply price
								// (design parity) — only if the user hasn't entered one.
								if (p && !(unitCost > 0)) {
									setValue(`items.${index}.unitCost` as const, p.supplyPrice ?? 0, {
										shouldDirty: true,
									});
								}
							}}
						/>
					)}
				/>
				<Controller
					name={`items.${index}.quantity` as const}
					control={control}
					render={({ field, fieldState }) => (
						<NumericField
							{...field}
							size="small"
							disabled={disabled}
							error={!!fieldState.error}
							inlineHint={false}
							slotProps={{
								input: {
									endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
								},
							}}
						/>
					)}
				/>
				<Controller
					name={`items.${index}.lowStockThreshold` as const}
					control={control}
					render={({ field, fieldState }) => (
						<ThresholdField
							name={field.name}
							ref={field.ref}
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							measurement={measurement}
							size="small"
							placeholder="—"
							disabled={disabled}
							error={!!fieldState.error}
							inlineHint={false}
						/>
					)}
				/>
				<Controller
					name={`items.${index}.unitCost` as const}
					control={control}
					render={({ field, fieldState }) => (
						<MoneyField
							value={field.value || 0}
							onChange={(v) => field.onChange(v)}
							size="small"
							placeholder="0"
							disabled={disabled}
							error={!!fieldState.error}
							slotProps={{
								input: {
									endAdornment: <UzsAdornment />,
								},
							}}
						/>
					)}
				/>
				<Typography
					sx={{
						...numericSx,
						fontWeight: 700,
						textAlign: "right",
						color: lineValue > 0 ? "text.primary" : "text.disabled",
					}}
				>
					{lineValue > 0 ? formatCurrency(lineValue) : "—"}
				</Typography>
				<Button
					onClick={() => !onlyLine && onRemove()}
					disabled={onlyLine}
					aria-label={t("common.delete")}
					sx={{
						minWidth: 0,
						width: 38,
						height: 38,
						p: 0,
						border: "1px solid",
						borderColor: designTokens.borderStrong,
						color: "text.disabled",
						"&:hover": {
							color: "error.main",
							borderColor: designTokens.errorBorder,
							bgcolor: designTokens.errorBg,
						},
					}}
				>
					<DeleteOutlineIcon sx={{ fontSize: 18 }} />
				</Button>
			</Box>
			{errorMessage && (
				<Typography sx={{ fontSize: 12, color: "error.main", mt: "6px" }}>
					{errorMessage}
				</Typography>
			)}
		</Box>
	);
};

export default OpeningStockLineRow;
