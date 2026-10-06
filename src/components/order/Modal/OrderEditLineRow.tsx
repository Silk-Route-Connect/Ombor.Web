import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormFieldLabel } from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import { OrderLineDiscountType } from "models/order";
import { Measurement } from "models/product";
import { controlSize, designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { lineNet } from "utils/orderUtils";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, ButtonBase, IconButton, InputBase, Typography } from "@mui/material";

export type EditLine = {
	productId: number;
	productName: string;
	sku: string;
	measurement: Measurement;
	quantity: number;
	unitPrice: number;
	discount: number;
	discountType: OrderLineDiscountType;
};

const DISCOUNT_TYPES: OrderLineDiscountType[] = ["Percentage", "Fixed"];

/** The field edge every control of the line shares (38px, 3.7:1 outline, r-md). */
const boxSx = {
	display: "inline-flex",
	alignItems: "center",
	height: controlSize.md.height,
	border: "1px solid",
	borderColor: designTokens.borderControl,
	borderRadius: `${radius.md}px`,
	overflow: "hidden",
	bgcolor: "background.paper",
} as const;

/**
 * Compact qty stepper (− input +). Reads a typed value like the POS cart line
 * (`CartLineQty`): a «,» / «.» is flagged with the whole-number hint and never
 * stripped («1,5» must not become 15 — R21); only a whole ≥ 1 commits, and blur
 * restores the last valid quantity. To be replaced by the shared QtyStepper.
 */
const OrderQtyStepper: React.FC<{
	value: number;
	disabled: boolean;
	onChange: (qty: number) => void;
}> = ({ value, disabled, onChange }) => {
	const { t } = useTranslation();
	const [draft, setDraft] = useState<string | null>(null);
	const [invalid, setInvalid] = useState(false);

	const reset = () => {
		setDraft(null);
		setInvalid(false);
	};
	const step = (next: number) => {
		reset();
		onChange(Math.max(1, next));
	};
	const type = (raw: string) => {
		if (!isQuantityDraft(raw)) {
			return;
		}
		setDraft(raw);
		const parsed = parseWholeQuantity(raw);
		setInvalid(parsed.kind === "fraction" || parsed.kind === "invalid");
		if (parsed.kind === "whole" && parsed.value >= 1) {
			onChange(parsed.value);
		}
	};

	const btnSx = { borderRadius: 0, width: 32, height: "100%", color: designTokens.fg2 } as const;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
			<Box sx={{ ...boxSx, borderColor: invalid ? "error.main" : designTokens.borderControl }}>
				<IconButton
					size="small"
					sx={btnSx}
					disabled={disabled || value <= 1}
					onClick={() => step(value - 1)}
				>
					<RemoveIcon sx={{ fontSize: 16 }} />
				</IconButton>
				<InputBase
					value={draft ?? String(value)}
					disabled={disabled}
					onFocus={(e) => e.currentTarget.select()}
					onChange={(e) => type(e.target.value)}
					onBlur={reset}
					inputProps={{ inputMode: "numeric", "aria-invalid": invalid }}
					sx={{
						width: 44,
						height: "100%",
						borderLeft: "1px solid",
						borderRight: "1px solid",
						borderColor: "divider",
						"& input": { textAlign: "center", ...numericSx, fontWeight: 600, fontSize: 14, p: 0 },
					}}
				/>
				<IconButton size="small" sx={btnSx} disabled={disabled} onClick={() => step(value + 1)}>
					<AddIcon sx={{ fontSize: 16 }} />
				</IconButton>
			</Box>
			{invalid && (
				// Zero-width so the hint runs on under the neighbouring controls instead
				// of widening the quantity column and shifting the row.
				<Typography
					role="alert"
					sx={{ width: 0, whiteSpace: "nowrap", fontSize: 12, color: "error.main" }}
				>
					{t("common.quantity.wholeOnly")}
				</Typography>
			)}
		</Box>
	);
};

interface OrderEditLineRowProps {
	line: EditLine;
	disabled: boolean;
	onChange: (patch: Partial<EditLine>) => void;
	onRemove: () => void;
}

/**
 * One editable order line: product · draft line sum, then quantity, unit price
 * and the discount with its «%» / fixed-sum toggle (the POS cart's glyph) — all
 * at the 38px control height under 12px captions.
 */
const OrderEditLineRow: React.FC<OrderEditLineRowProps> = ({
	line,
	disabled,
	onChange,
	onRemove,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				p: "14px 16px",
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{line.productName}</Typography>
					<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}>
						{line.sku}
					</Typography>
				</Box>
				<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 15 }}>
					{formatCurrency(lineNet(line))}
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					gap: "14px",
					flexWrap: "wrap",
					mt: "10px",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<FormFieldLabel variant="caption" label={t("order.edit.qty")} />
					<OrderQtyStepper
						value={line.quantity}
						disabled={disabled}
						onChange={(quantity) => onChange({ quantity })}
					/>
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<FormFieldLabel variant="caption" label={t("order.edit.unitPrice")} />
					<MoneyField
						value={line.unitPrice || 0}
						onChange={(unitPrice) => onChange({ unitPrice })}
						size="small"
						placeholder="0"
						disabled={disabled}
						sx={{ width: 160 }}
						slotProps={{
							input: { endAdornment: <UzsAdornment />, sx: { ...numericSx, fontWeight: 600 } },
						}}
					/>
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<FormFieldLabel variant="caption" label={t("order.edit.discount")} />
					<Box sx={{ display: "flex", gap: "6px" }}>
						<MoneyField
							value={line.discount || 0}
							onChange={(discount) => onChange({ discount })}
							size="small"
							placeholder="0"
							disabled={disabled}
							sx={{ width: 84 }}
							slotProps={{ input: { sx: { ...numericSx } } }}
						/>
						<Box sx={boxSx}>
							{DISCOUNT_TYPES.map((dt) => {
								const on = line.discountType === dt;
								return (
									<ButtonBase
										key={dt}
										onClick={() => onChange({ discountType: dt })}
										disabled={disabled}
										aria-pressed={on}
										title={dt === "Fixed" ? t("order.new.line.fixedHint") : undefined}
										sx={{
											minWidth: 36,
											height: "100%",
											fontSize: 13,
											fontWeight: 600,
											color: on ? "primary.dark" : "text.secondary",
											bgcolor: on ? designTokens.primarySoft : "transparent",
										}}
									>
										{dt === "Percentage" ? "%" : <PaymentsOutlinedIcon sx={{ fontSize: 16 }} />}
									</ButtonBase>
								);
							})}
						</Box>
					</Box>
				</Box>
				<IconButton
					onClick={onRemove}
					aria-label={t("common.delete")}
					sx={{
						ml: "auto",
						mt: "20px",
						width: controlSize.md.height,
						height: controlSize.md.height,
						color: designTokens.fg3,
						"&:hover": { bgcolor: designTokens.errorBg, color: "error.main" },
					}}
				>
					<DeleteOutlineIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>
		</Box>
	);
};

export default OrderEditLineRow;
