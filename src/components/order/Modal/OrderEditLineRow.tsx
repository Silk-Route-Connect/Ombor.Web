import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import MoneyField from "components/shared/Inputs/MoneyField";
import QtyStepper from "components/shared/Inputs/QtyStepper";
import LineDiscountField from "components/transaction/Create/LineDiscountField";
import LineRemoveButton from "components/transaction/Create/LineRemoveButton";
import { OrderLineDiscountType } from "models/order";
import { Measurement } from "models/product";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { lineNet } from "utils/orderUtils";

import { Box, Typography } from "@mui/material";

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

interface OrderEditLineRowProps {
	line: EditLine;
	disabled: boolean;
	onChange: (patch: Partial<EditLine>) => void;
	onRemove: () => void;
}

/**
 * One editable order line: product · draft line sum, then quantity, unit price
 * and the discount with its «% | UZS» toggle — the same stepper, money field and
 * discount control as the New Order / POS lines, under 12px captions.
 */
const OrderEditLineRow: React.FC<OrderEditLineRowProps> = ({
	line,
	disabled,
	onChange,
	onRemove,
}) => {
	const { t } = useTranslation();
	const id = useId();

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
				<FormField variant="caption" label={t("order.edit.qty")} htmlFor={`${id}-qty`}>
					<QtyStepper
						id={`${id}-qty`}
						value={line.quantity}
						disabled={disabled}
						onChange={(quantity) => onChange({ quantity })}
					/>
				</FormField>
				<FormField variant="caption" label={t("order.edit.unitPrice")} htmlFor={`${id}-price`}>
					<MoneyField
						id={`${id}-price`}
						value={line.unitPrice || 0}
						onChange={(unitPrice) => onChange({ unitPrice })}
						placeholder="0"
						disabled={disabled}
						fullWidth={false}
						sx={{ width: 160 }}
					/>
				</FormField>
				<FormField variant="caption" label={t("order.edit.discount")} htmlFor={`${id}-discount`}>
					<LineDiscountField
						id={`${id}-discount`}
						value={line.discount || 0}
						type={line.discountType}
						disabled={disabled}
						onValueChange={(discount) => onChange({ discount })}
						onTypeChange={(discountType) => onChange({ discountType })}
					/>
				</FormField>
				<LineRemoveButton label={t("common.delete")} onClick={onRemove} />
			</Box>
		</Box>
	);
};

export default OrderEditLineRow;
