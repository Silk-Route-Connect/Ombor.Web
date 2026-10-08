import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import MoneyField from "components/shared/Inputs/MoneyField";
import QtyStepper from "components/shared/Inputs/QtyStepper";
import UzsUnit from "components/shared/Money/UzsUnit";
import LineRemoveButton from "components/transaction/Create/LineRemoveButton";
import { LINE_CONTROL_OFFSET } from "components/transaction/Create/posStyles";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

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
	const id = useId();

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
			<Box sx={{ minWidth: 0, mt: LINE_CONTROL_OFFSET }}>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{productName}</Typography>
				<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}>
					{sku} · {formatCurrency(quantity * unitPrice)}
					<UzsUnit />
				</Typography>
			</Box>

			<FormField variant="caption" label={t("template.form.qtyLabel")} htmlFor={`${id}-qty`}>
				<QtyStepper
					id={`${id}-qty`}
					value={quantity}
					disabled={disabled}
					onChange={(q) => onChange({ quantity: q })}
				/>
			</FormField>

			<FormField variant="caption" label={t("template.form.priceLabel")} htmlFor={`${id}-price`}>
				<MoneyField
					id={`${id}-price`}
					value={unitPrice || 0}
					onChange={(price) => onChange({ unitPrice: price })}
					placeholder="0"
					disabled={disabled}
					fullWidth={false}
					sx={{ width: 160 }}
				/>
			</FormField>

			<LineRemoveButton label={t("common.delete")} onClick={onRemove} />
		</Box>
	);
};

export default TemplateLineRow;
