import React from "react";
import { useTranslation } from "react-i18next";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { Template } from "models/template";

import { Button } from "@mui/material";

import BulkDiscountBar from "./BulkDiscountBar";
import CartLineRow from "./CartLineRow";
import LineEditorCard from "./LineEditorCard";
import TemplateLoadMenu from "./TemplateLoadMenu";

interface TransactionCartProps {
	entry: UseTransactionEntry;
	/** The partner's templates — offered while the cart is empty. */
	templates: Template[];
	onLoadTemplate: (template: Template) => void;
	bulkApplied: number;
	onBulkApplied: (pct: number) => void;
	/** Product whose just-added line grabs + selects its quantity field. */
	focusQtyId: number | null;
	onQtyFocused: () => void;
	/** Back to the product search (Enter in a line, «+ Добавить товар»). */
	onContinue: () => void;
}

/** The New Sale / Supply «Позиции» card: lines, the add row and the bulk discount. */
export const TransactionCart: React.FC<TransactionCartProps> = ({
	entry,
	templates,
	onLoadTemplate,
	bulkApplied,
	onBulkApplied,
	focusQtyId,
	onQtyFocused,
	onContinue,
}) => {
	const { t } = useTranslation();
	const { direction } = entry;

	return (
		<LineEditorCard
			title={t("transaction.new.cart.title")}
			count={entry.count}
			action={
				entry.items.length > 0 ? (
					<Button
						variant="text"
						size="small"
						onClick={() => {
							entry.clearItems();
							onBulkApplied(0);
						}}
					>
						{t("transaction.new.cart.clear")}
					</Button>
				) : (
					entry.partner && (
						<TemplateLoadMenu direction={direction} templates={templates} onLoad={onLoadTemplate} />
					)
				)
			}
			empty={{
				title: t("transaction.new.cart.emptyTitle"),
				errorTitle: t("transaction.new.cart.emptyErrorTitle"),
				body: t("transaction.new.cart.emptyBody"),
				showError: entry.tried && entry.items.length === 0,
			}}
			addLabel={t("transaction.new.cart.addProduct")}
			onAdd={onContinue}
			footer={
				<BulkDiscountBar
					applied={bulkApplied}
					onApply={(pct) => {
						entry.applyBulk(pct);
						onBulkApplied(pct);
					}}
				/>
			}
		>
			{entry.items.map((item, index) => (
				<CartLineRow
					key={item.product.id}
					direction={direction}
					item={item}
					warehouseId={entry.warehouseId}
					lineTotal={entry.lineTotal(item)}
					lineDiscount={entry.lineDiscount(item)}
					autoFocusQty={focusQtyId === item.product.id}
					onChange={(patch) => entry.updateItem(index, patch)}
					onRemove={() => entry.removeItem(index)}
					onAutoFocused={onQtyFocused}
					onContinue={onContinue}
				/>
			))}
		</LineEditorCard>
	);
};

export default TransactionCart;
