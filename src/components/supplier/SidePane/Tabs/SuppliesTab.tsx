// src/components/supplier/SupplierSuppliesTab.tsx
import React, { useEffect, useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Link, Menu, MenuItem } from "@mui/material";
import DateRangePicker, { RangeOption } from "components/shared/DateRangePicker/DateRangePicker";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Supply } from "models/supply";
import { useStore } from "stores/StoreContext";
import { formatPrice } from "utils/supplyUtils";

import SupplyItemsTable from "./../SupplyItemsTable/SupplyItemsTable";

interface SupplierSuppliesTabProps {
	supplierId: number;
}

const SupplierSuppliesTab: React.FC<SupplierSuppliesTabProps> = observer(({ supplierId }) => {
	const { supplierStore } = useStore();

	// Date range state
	const [rangeOption, setRangeOption] = useState<RangeOption>("week");
	const [fromDate, setFromDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
	const [toDate, setToDate] = useState<Date>(new Date());
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const menuOpen = Boolean(anchorEl);

	// Reload supplies when filters change
	useEffect(() => {
		if (!supplierId) return;
		supplierStore.loadSupplies({
			supplierId,
			from: fromDate,
			to: toDate,
		});
	}, [supplierId, fromDate, toDate, supplierStore]);

	const suppliesLoadable = supplierStore.supplies; // Loadable<Supply[]>

	const handleDateChange = ({
		from,
		to,
		option,
	}: {
		from: Date;
		to: Date;
		option: RangeOption;
	}) => {
		setRangeOption(option);
		setFromDate(from);
		setToDate(to);
	};

	// Column definitions for the main supplies table
	const supplyColumns: Column<Supply>[] = [
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
			renderCell: (s) => s.notes ?? "—",
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
		// later: implement PDF logic (client/server)
	};
	const handleDownloadCSV = () => {
		handleMenuClose();
		console.log("Download as CSV clicked");
		// later: implement CSV logic (client/server)
	};
	const handleDownloadPNG = () => {
		handleMenuClose();
		console.log("Download as PNG clicked");
		// later: implement PNG logic (client/server)
	};

	return (
		<Box sx={{ p: 2 }}>
			{/* Top controls: Date range + Search */}
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
					<DateRangePicker
						initialOption={rangeOption}
						initialFrom={fromDate}
						initialTo={toDate}
						onChange={handleDateChange}
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

			{/* The expandable table */}
			<ExpandableDataTable<Supply>
				rows={suppliesLoadable}
				columns={supplyColumns}
				pagination
				renderExpanded={(supply) => <SupplyItemsTable items={supply.items} />}
			/>
		</Box>
	);
});

export default SupplierSuppliesTab;
