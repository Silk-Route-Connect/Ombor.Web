import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Product } from "models/product";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { buildProductColumns, ProductColumnHandlers } from "./productTableConfigs";

interface ProductsTableProps extends ProductColumnHandlers {
	data: Loadable<Product[]>;
	isFiltering: boolean;
	onCreate: () => void;
	onOpen: (product: Product) => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить товары». */
	errorTitle: string;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Product>;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
	onRetry,
	errorTitle,
	data,
	isFiltering,
	onCreate,
	onOpen,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
	exportOrder,
}) => {
	const { t } = useTranslation();
	const columns = useMemo(
		() => buildProductColumns(t, { onEdit, onArchive, onRestore, onDelete }),
		[t, onEdit, onArchive, onRestore, onDelete],
	);

	return (
		<DataTable<Product>
			exportOrder={exportOrder}
			rows={data}
			onRetry={onRetry}
			errorTitle={errorTitle}
			columns={columns}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
			empty={
				<TableEmptyState
					icon={<Inventory2OutlinedIcon />}
					title={isFiltering ? t("product.empty.searchTitle") : t("product.empty.title")}
					hint={isFiltering ? t("product.empty.searchBody") : t("product.empty.body")}
					action={isFiltering ? undefined : { label: t("product.create"), onClick: onCreate }}
				/>
			}
		/>
	);
};

export default ProductsTable;
