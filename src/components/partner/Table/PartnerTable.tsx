import React from "react";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import { DataTable } from "components/shared/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Partner } from "models/partner";

import { partnerColumns } from "./partnerTableConfigs";

interface PartnerTableProps {
	data: Loadable<Partner[]>;
	pagination: boolean;

	onSort: (field: keyof Partner, order: "asc" | "desc") => void;
	onDelete: (partner: Partner) => void;
	onEdit: (partner: Partner) => void;
	onArchive: (partner: Partner) => void;
	onViewDetails: (partner: Partner) => void;
}

export const PartnerTable: React.FC<PartnerTableProps> = ({
	data,
	pagination,
	onSort,
	onDelete,
	onEdit,
	onArchive,
	onViewDetails,
}) => {
	const columns = [
		...partnerColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (partner: Partner) => (
				<ActionMenuCell
					onEdit={() => onEdit(partner)}
					onDelete={() => onDelete(partner)}
					onArchive={() => onArchive(partner)}
				/>
			),
		},
	];

	return (
		<DataTable<Partner>
			rows={data}
			columns={columns}
			pagination={pagination}
			onSort={onSort}
			onRowClick={onViewDetails}
		/>
	);
};
