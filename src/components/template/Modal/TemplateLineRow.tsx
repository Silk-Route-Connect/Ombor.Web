import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormFieldLabel } from "components/shared/Forms/FormFieldLabel";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import UzsUnit from "components/shared/Money/UzsUnit";
import { controlSize, designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, IconButton, InputBase, Typography } from "@mui/material";

/**
 * Compact qty stepper (− input +). Reads a typed value like the POS cart line
 * (`CartLineQty`): a «,» / «.» is flagged with the whole-number hint and never
 * stripped («1,5» must not become 15 — R21); only a whole ≥ 1 commits, and blur
 * restores the last valid quantity. To be replaced by the shared QtyStepper.
 */
const TemplateQtyStepper: React.FC<{
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
			<Box
				sx={{
					display: "inline-flex",
					alignItems: "center",
					height: controlSize.md.height,
					border: "1px solid",
					borderColor: invalid ? "error.main" : designTokens.borderControl,
					borderRadius: `${radius.md}px`,
					overflow: "hidden",
					bgcolor: "background.paper",
				}}
			>
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

/** Caption line (16px) + its 4px gap: where a line's controls start. */
const CONTROL_OFFSET = "20px";

interface TemplateLineRowProps {
	productName: string;
	sku: string;
	quantity: number;
	unitPrice: number;
	disabled: boolean;
	onChange: (patch: { quantity?: number; unitPrice?: number }) => void;
	onRemove: () => void;
}

/** One template line: product · draft line sum, the quantity, the unit price, remove. */
const TemplateLineRow: React.FC<TemplateLineRowProps> = ({
	productName,
	sku,
	quantity,
	unitPrice,
	disabled,
	onChange,
	onRemove,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "1fr auto auto auto",
				gap: "16px",
				alignItems: "start",
				p: "13px 16px",
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			{/* Name and sum line up with the controls, below the captions. */}
			<Box sx={{ minWidth: 0, mt: CONTROL_OFFSET }}>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{productName}</Typography>
				<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}>
					{sku} · {formatCurrency(quantity * unitPrice)}
					<UzsUnit />
				</Typography>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
				<FormFieldLabel variant="caption" label={t("template.form.qtyLabel")} />
				<TemplateQtyStepper
					value={quantity}
					disabled={disabled}
					onChange={(q) => onChange({ quantity: q })}
				/>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
				<FormFieldLabel variant="caption" label={t("template.form.priceLabel")} />
				<MoneyField
					value={unitPrice || 0}
					onChange={(price) => onChange({ unitPrice: price })}
					size="small"
					placeholder="0"
					disabled={disabled}
					sx={{ width: 160 }}
					slotProps={{
						input: { endAdornment: <UzsAdornment />, sx: { ...numericSx, fontWeight: 600 } },
					}}
				/>
			</Box>

			<IconButton
				onClick={onRemove}
				aria-label={t("common.delete")}
				sx={{
					mt: CONTROL_OFFSET,
					width: controlSize.md.height,
					height: controlSize.md.height,
					color: designTokens.fg3,
					"&:hover": { bgcolor: designTokens.errorBg, color: "error.main" },
				}}
			>
				<DeleteOutlineIcon sx={{ fontSize: 18 }} />
			</IconButton>
		</Box>
	);
};

export default TemplateLineRow;
