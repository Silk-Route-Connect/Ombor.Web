import React from "react";
import { Column, DataTable, SortOrder } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Warehouse } from "models/warehouse";

import WarehouseActionMenu from "./ActionMenu/WarehouseActionMenu";
import { warehouseTableColumns } from "./warehouseTableConfig";

interface WarehouseTableProps {
	data: Loadable<Warehouse[]>;
	onSort: (field: keyof Warehouse, order: SortOrder) => void;
	onRowClick: (warehouse: Warehouse) => void;
	onEdit: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
	onAdjustStock: (warehouse: Warehouse) => void;
	onTransfer: (warehouse: Warehouse) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
	data: rows,
	onSort,
	onRowClick,
	onEdit,
	onDelete,
	onAdjustStock,
	onTransfer,
}) => {
	const columns: Column<Warehouse>[] = [
		...warehouseTableColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (warehouse: Warehouse) => (
				<WarehouseActionMenu
					onEdit={() => onEdit(warehouse)}
					onAdjustStock={() => onAdjustStock(warehouse)}
					onTransfer={() => onTransfer(warehouse)}
					onArchive={() => {}} // No-op for now
					onDelete={() => onDelete(warehouse)}
				/>
			),
		},
	];

	return (
		<DataTable<Warehouse>
			rows={rows}
			columns={columns}
			pagination
			onSort={onSort}
			onRowClick={onRowClick}
		/>
	);
};

export default WarehouseTable;
