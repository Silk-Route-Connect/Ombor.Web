import React, { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Link, Menu, MenuItem } from "@mui/material";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";
import { formatNotes } from "utils/stringUtils";
import { formatPrice } from "utils/supplyUtils";

import SupplyItemsTable from "./../SupplyItemsTable/SupplyItemsTable";

interface SupplierSuppliesTabProps {
	partnerId: number;
}

const SupplierSuppliesTab: React.FC<SupplierSuppliesTabProps> = observer(({ partnerId }) => {
	const { selectedPartnerStore } = useStore();

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const menuOpen = Boolean(anchorEl);

	useEffect(() => {
		if (!partnerId) {
			return;
		}

		selectedPartnerStore.getTransactions("Supply");
	}, [partnerId, selectedPartnerStore]);

	const supplyColumns: Column<TransactionRecord>[] = [
		{
			key: "id",
			field: "id",
			headerName: translate("fieldId"),
			width: 80,
			renderCell: (s) => (
				<Link
					href={`/supplies/${s.id}`}
					underline="none"
					sx={{
						color: "#1976d2",
						"&:hover": {
							textDecoration: "underline",
						},
					}}
				>
					{s.id}
				</Link>
			),
		},
		{
			key: "date",
			field: "date",
			headerName: translate("fieldDate"),
			width: 120,
			renderCell: (s) => new Date(s.date).toLocaleDateString("ru-RU"),
		},
		{
			key: "totalDue",
			field: "totalDue",
			headerName: translate("fieldTotalDue"),
			align: "right",
			width: 120,
			renderCell: (s) => formatPrice(s.totalDue),
		},
		{
			key: "totalPaid",
			field: "totalPaid",
			headerName: translate("fieldTotalPaid"),
			align: "right",
			width: 120,
			renderCell: (s) => formatPrice(s.totalPaid),
		},
		{
			key: "notes",
			field: "notes",
			headerName: translate("fieldNotes"),
			width: 200,
			renderCell: (s) => formatNotes(s.notes),
		},
	];

	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleDownloadPDF = () => {
		handleMenuClose();
		console.log("Download as PDF clicked");
		// TODO: implement PDF logic (client/server)
	};
	const handleDownloadCSV = () => {
		handleMenuClose();
		console.log("Download as CSV clicked");
		// TODO: implement CSV logic (client/server)
	};
	const handleDownloadPNG = () => {
		handleMenuClose();
		console.log("Download as PNG clicked");
		// TODO: implement PNG logic (client/server)
	};

	return (
		<Box sx={{ p: 2 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					gap: 2,
				}}
			>
				<Box sx={{ flexGrow: 1, minWidth: 240 }}>
					<DateFilterPicker
						value={selectedPartnerStore.dateFilter}
						onChange={(filter) =>
							filter.type === "custom"
								? selectedPartnerStore.setCustom(filter.from, filter.to)
								: selectedPartnerStore.setPreset(filter.preset)
						}
					/>
				</Box>

				<Button endIcon={<DownloadIcon />} onClick={handleMenuOpen} sx={{ textTransform: "none" }}>
					{translate("download")}
				</Button>

				<Menu
					anchorEl={anchorEl}
					open={menuOpen}
					onClose={handleMenuClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<MenuItem onClick={handleDownloadPDF}>{translate("downloadAsPDF")}</MenuItem>
					<MenuItem onClick={handleDownloadCSV}>{translate("downloadAsCSV")}</MenuItem>
					<MenuItem onClick={handleDownloadPNG}>{translate("downloadAsPNG")}</MenuItem>
				</Menu>
			</Box>

			<ExpandableDataTable<TransactionRecord>
				rows={selectedPartnerStore.supplies}
				columns={supplyColumns}
				pagination
				renderExpanded={(supply) => <SupplyItemsTable items={supply.lines} />}
			/>
		</Box>
	);
});

export default SupplierSuppliesTab;
