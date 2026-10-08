import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { Product } from "models/product";
import { TransferFormInputs } from "schemas/TransferSchema";
import { designTokens, numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, InputAdornment, Typography } from "@mui/material";

import TransferProductOption from "./TransferProductOption";

interface TransferLineRowProps {
	index: number;
	control: Control<TransferFormInputs>;
	product: Product | null;
	/** A product id is set on the line (availability shows under it). */
	picked: boolean;
	/** Products this line may pick (not picked on another line). */
	options: Product[];
	quantity: number;
	unit: string;
	/** Served stock of the line's product in the source warehouse. */
	avail: number;
	over: boolean;
	fromName: string;
	/** The only line cannot be removed. */
	onlyLine: boolean;
	disabled: boolean;
	availFor: (productId: number) => number;
	onRemove: () => void;
}

/**
 * One transfer line: product (with its stock in the source warehouse in the
 * options), quantity in the product's unit, remove — and under it what the
 * source holds, flagged when the line asks for more (rule 20).
 */
const TransferLineRow: React.FC<TransferLineRowProps> = ({
	index,
	control,
	product,
	picked,
	options,
	quantity,
	unit,
	avail,
	over,
	fromName,
	onlyLine,
	disabled,
	availFor,
	onRemove,
}) => {
	const { t } = useTranslation();

	return (
		<Box>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 150px 38px",
					gap: "10px",
					alignItems: "start",
				}}
			>
				<Controller
					name={`lines.${index}.productId` as const}
					control={control}
					render={({ field, fieldState }) => (
						<EntityAutocomplete<Product>
							placeholder={t("transfer.form.productPlaceholder")}
							size="small"
							options={options}
							value={product}
							error={!!fieldState.error}
							additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
							onChange={(p) => field.onChange(p?.id ?? 0)}
							renderOption={(optionProps, option) => {
								const { key, ...liProps } = optionProps as React.HTMLAttributes<HTMLLIElement> & {
									key?: React.Key;
								};
								return (
									<Box component="li" key={option.id} {...liProps} sx={{ gap: "12px" }}>
										<TransferProductOption product={option} stock={availFor(option.id)} />
									</Box>
								);
							}}
						/>
					)}
				/>
				<Controller
					name={`lines.${index}.quantity` as const}
					control={control}
					render={({ field, fieldState }) => (
						<NumericField
							{...field}
							size="small"
							disabled={disabled}
							error={!!fieldState.error || over}
							slotProps={{
								input: {
									endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
								},
							}}
						/>
					)}
				/>
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
			{picked && (
				<Typography sx={{ fontSize: 12, mt: "6px", color: over ? "error.main" : "text.secondary" }}>
					{t("transfer.form.available", { warehouse: fromName })}{" "}
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							color: over ? "error.main" : designTokens.gray700,
						}}
					>
						{formatQuantity(avail)} {unit}
					</Box>
					{over &&
						` ${t("transfer.form.overStockSuffix", { requested: formatQuantity(quantity), unit })}`}
				</Typography>
			)}
		</Box>
	);
};

export default TransferLineRow;
