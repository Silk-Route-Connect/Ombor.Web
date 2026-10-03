import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import ProductTypeChip from "components/product/ProductTypeChip";
import StockQuantityCell from "components/product/StockQuantityCell";
import { ProductActionMenu } from "components/product/Table/ActionMenu/ProductActionMenu";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TFunction } from "i18next";
import { Product } from "models/product";
import { productStockLevel } from "utils/productFilters";

import ProductThumb from "./ProductThumb";

export interface ProductColumnHandlers {
	onEdit: (product: Product) => void;
	onArchive: (product: Product) => void;
	onRestore: (product: Product) => void;
	onDelete: (product: Product) => void;
}

/** A price that does not apply to the product's type renders «—», a real 0 renders «0». */
const salePriceOf = (p: Product): number | null => (p.type === "Supply" ? null : p.salePrice);
const supplyPriceOf = (p: Product): number | null => (p.type === "Sale" ? null : p.supplyPrice);

/**
 * Product list columns in the canonical order (conventions.md → Tables):
 * Артикул · Товар · Тип · Категория · Остаток (with its unit and the «Мало» /
 * «Нет в наличии» alert) · Цена продажи · Цена поставки · ⋮. The unit rides on
 * the stock figure, so the list fits 1366px without a horizontal scroll (live-ui-8).
 */
export function buildProductColumns(
	t: TFunction,
	handlers: ProductColumnHandlers,
): Column<Product>[] {
	return [
		{
			key: "sku",
			headerName: t("product.table.sku"),
			sortValue: (p) => p.sku,
			renderCell: (p) => <SkuCell sku={p.sku} />,
		},
		{
			key: "name",
			headerName: t("product.table.name"),
			sortValue: (p) => p.name,
			renderCell: (p) => (
				<EntityCell archived={p.isArchived} avatar={<ProductThumb product={p} />}>
					<ProductLink id={p.id} name={p.name} archived={p.isArchived} />
				</EntityCell>
			),
		},
		{
			key: "type",
			headerName: t("product.table.type"),
			sortValue: (p) => t(`product.type.${p.type}`),
			renderCell: (p) => <ProductTypeChip type={p.type} dimmed={p.isArchived} />,
		},
		{
			key: "category",
			headerName: t("product.table.category"),
			sortValue: (p) => p.categoryName ?? "",
			renderCell: (p) => <MutedTextCell text={p.categoryName} />,
		},
		{
			key: "totalStock",
			headerName: t("product.table.stock"),
			align: "right",
			sortValue: (p) => p.totalStock,
			// Archived products are out of trade — no stock alert on them.
			renderCell: (p) => (
				<StockQuantityCell
					quantity={p.totalStock}
					measurement={p.measurement}
					level={p.isArchived ? "ok" : productStockLevel(p)}
				/>
			),
		},
		{
			key: "salePrice",
			headerName: t("product.table.salePrice"),
			align: "right",
			sortValue: salePriceOf,
			renderCell: (p) => <MoneyCell value={salePriceOf(p)} main />,
		},
		{
			key: "supplyPrice",
			headerName: t("product.table.supplyPrice"),
			align: "right",
			sortValue: supplyPriceOf,
			renderCell: (p) => <MoneyCell value={supplyPriceOf(p)} />,
		},
		{
			key: "actions",
			headerName: "",
			width: ACTIONS_COLUMN_WIDTH,
			align: "right",
			renderCell: (p) => (
				<ProductActionMenu
					product={p}
					onEdit={() => handlers.onEdit(p)}
					onArchive={() => handlers.onArchive(p)}
					onRestore={() => handlers.onRestore(p)}
					onDelete={() => handlers.onDelete(p)}
				/>
			),
		},
	];
}
