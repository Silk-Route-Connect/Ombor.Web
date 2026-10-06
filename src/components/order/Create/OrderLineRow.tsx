import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import QtyStepper from "components/shared/Inputs/QtyStepper";
import LineDiscountField from "components/transaction/Create/LineDiscountField";
import LineMoneyInput from "components/transaction/Create/LineMoneyInput";
import LineRemoveButton from "components/transaction/Create/LineRemoveButton";
import LineRowHead from "components/transaction/Create/LineRowHead";
import { LINE_PRICE_WIDTH, POS_CARD_PADDING } from "components/transaction/Create/posStyles";
import { CartItem, stockAt } from "hooks/transactions/useTransactionEntry";
import { measurementShort, measurementShortLabel } from "utils/productUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

interface OrderLineRowProps {
	item: CartItem;
	warehouseId: number | null;
	lineTotal: number;
	lineDiscount: number;
	onChange: (patch: Partial<CartItem>) => void;
	onRemove: () => void;
}

/**
 * One editable order line: quantity stepper, editable unit price, line discount
 * (% or a fixed sum), and live line total + discount amount. Unlike the
 * sale/supply cart line, stock is shown only as GUIDANCE — an order is a pending
 * intent, so an over-stock quantity is flagged but never blocks creation (the
 * real stock check happens at delivery).
 */
export const OrderLineRow: React.FC<OrderLineRowProps> = ({
	item,
	warehouseId,
	lineTotal,
	lineDiscount,
	onChange,
	onRemove,
}) => {
	const { t } = useTranslation();
	const id = useId();
	const unit = measurementShort(t, item.product.measurement);
	const unitLabel = measurementShortLabel(t, item.product.measurement);
	const stock = stockAt(item.product, warehouseId);
	const over = warehouseId != null && item.quantity > stock;

	return (
		<Box
			sx={{
				p: POS_CARD_PADDING,
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<LineRowHead
				name={item.product.name}
				sku={item.product.sku}
				status={{
					icon: <Inventory2OutlinedIcon />,
					text:
						warehouseId == null ? (
							t("order.new.line.noWarehouse")
						) : (
							<>
								{t("order.new.line.inStock", { count: stock, unit })}
								{over && <> {t("order.new.line.overStock")}</>}
							</>
						),
					color: over ? "warning.dark" : "text.secondary",
				}}
				lineTotal={lineTotal}
				lineDiscount={lineDiscount}
			/>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					gap: "16px",
					flexWrap: "wrap",
					mt: "12px",
				}}
			>
				<FormField
					variant="caption"
					label={t("order.new.line.qty", { unit: unitLabel })}
					htmlFor={`${id}-qty`}
				>
					<QtyStepper
						id={`${id}-qty`}
						value={item.quantity}
						onChange={(quantity) => onChange({ quantity })}
					/>
				</FormField>
				<FormField
					variant="caption"
					label={t("order.new.line.price", { unit: unitLabel })}
					htmlFor={`${id}-price`}
				>
					<LineMoneyInput
						id={`${id}-price`}
						value={item.unitPrice}
						onChange={(unitPrice) => onChange({ unitPrice })}
						prefix="×"
						width={LINE_PRICE_WIDTH}
					/>
				</FormField>
				<FormField
					variant="caption"
					label={t("order.new.line.discount")}
					htmlFor={`${id}-discount`}
				>
					<LineDiscountField
						id={`${id}-discount`}
						value={item.discountValue}
						type={item.discountType}
						onValueChange={(discountValue) => onChange({ discountValue })}
						onTypeChange={(discountType) => onChange({ discountType })}
					/>
				</FormField>
				<LineRemoveButton label={t("order.new.line.remove")} onClick={onRemove} />
			</Box>
		</Box>
	);
};

export default OrderLineRow;
