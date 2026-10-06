import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import FormField from "components/shared/Forms/FormField";
import { CartItem, stockAt } from "hooks/transactions/useTransactionEntry";
import { designTokens } from "theme";
import { measurementShort, measurementShortLabel } from "utils/productUtils";
import { TransactionDirection } from "utils/transactionUtils";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

import { CartLineQty } from "./CartLineQty";
import LineDiscountField from "./LineDiscountField";
import LineMoneyInput from "./LineMoneyInput";
import LineRemoveButton from "./LineRemoveButton";
import LineRowHead, { LineStatus } from "./LineRowHead";
import { POS_CARD_PADDING } from "./posStyles";

interface CartLineRowProps {
	direction: TransactionDirection;
	item: CartItem;
	warehouseId: number | null;
	lineTotal: number;
	lineDiscount: number;
	/** Focus + select this row's quantity field (set right after the line is added). */
	autoFocusQty: boolean;
	onChange: (patch: Partial<CartItem>) => void;
	onRemove: () => void;
	/** Called once the row has consumed the autofocus request. */
	onAutoFocused: () => void;
	/** Enter in the quantity field → continue adding (refocus the product search). */
	onContinue: () => void;
}

/**
 * One rich cart line: quantity stepper, editable unit price, line discount
 * (% or a fixed sum — rules 37–38), live line total + discount amount, and
 * per-line stock validation (hard-blocks over-stock before submit).
 */
export const CartLineRow: React.FC<CartLineRowProps> = ({
	direction,
	item,
	warehouseId,
	lineTotal,
	lineDiscount,
	autoFocusQty,
	onChange,
	onRemove,
	onAutoFocused,
	onContinue,
}) => {
	const { t } = useTranslation();
	const id = useId();
	const isSale = direction === "Sale";
	const unit = measurementShort(t, item.product.measurement);
	const stock = stockAt(item.product, warehouseId);
	// A supply adds stock, so over-stock never applies — only sales validate it.
	const over = isSale && item.quantity > stock;
	const near = isSale && !over && stock > 0 && item.quantity / stock >= 0.8;

	const status: LineStatus | undefined = isSale
		? {
				icon: over ? <ErrorOutlineIcon /> : <Inventory2OutlinedIcon />,
				text: over
					? t("transaction.new.line.over", { count: stock, unit })
					: t("transaction.new.line.inStock", { count: stock, unit }),
				color: over ? "error.main" : near ? "warning.dark" : "text.secondary",
			}
		: undefined;

	return (
		<Box
			sx={{
				p: POS_CARD_PADDING,
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
				bgcolor: over ? designTokens.errorBg : "transparent",
			}}
		>
			<LineRowHead
				name={item.product.name}
				sku={item.product.sku}
				status={status}
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
				<CartLineQty
					id={`${id}-qty`}
					item={item}
					autoFocusQty={autoFocusQty}
					onChange={onChange}
					onAutoFocused={onAutoFocused}
					onContinue={onContinue}
				/>
				<FormField
					variant="caption"
					label={t(isSale ? "transaction.new.line.price" : "transaction.new.line.priceSupply", {
						unit: measurementShortLabel(t, item.product.measurement),
					})}
					htmlFor={`${id}-price`}
				>
					<LineMoneyInput
						id={`${id}-price`}
						value={item.unitPrice}
						onChange={(unitPrice) => onChange({ unitPrice })}
						onEnter={onContinue}
						prefix="×"
						width={152}
					/>
				</FormField>
				<FormField
					variant="caption"
					label={t("transaction.new.line.discount")}
					htmlFor={`${id}-discount`}
				>
					<LineDiscountField
						id={`${id}-discount`}
						value={item.discountValue}
						type={item.discountType}
						onValueChange={(discountValue) => onChange({ discountValue })}
						onTypeChange={(discountType) => onChange({ discountType })}
						onEnter={onContinue}
					/>
				</FormField>
				<LineRemoveButton label={t("transaction.new.line.remove")} onClick={onRemove} />
			</Box>

			{over && (
				<Callout tone="danger" sx={{ mt: "12px" }}>
					{t("transaction.new.line.errOver", { count: stock, unit })}
				</Callout>
			)}
		</Box>
	);
};

export default CartLineRow;
