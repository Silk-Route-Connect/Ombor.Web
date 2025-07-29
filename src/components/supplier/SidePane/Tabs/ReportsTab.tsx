import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import DateRangePicker from "components/shared/DateRangePicker/DateRangePicker";
import { translate } from "i18n/i18n";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";

export interface ReportsTabProps {
	partnerId: number;
	from: Date;
	to: Date;
	onDateChange: (range: { from: Date; to: Date }) => void;
}

export interface ConsolidatedReport {
	id: number;
	date: string;
	dueAmount: number;
	paymentAmount: number;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ partnerId, from, to, onDateChange }) => {
	const { selectedPartnerStore } = useStore();

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const menuOpen = Boolean(anchorEl);

	useEffect(() => {
		if (partnerId && from && to) {
			selectedPartnerStore.getTransactions(null);
		}
	}, [partnerId, from, to, selectedPartnerStore]);

	const columns: Column<TransactionRecord>[] = [
		{
			key: "id",
			field: "id",
			headerName: translate("fieldSupplyId"),
			width: 80,
			renderCell: (row) => (
				<RouterLink to={`/supplies/${row.id}`} style={{ color: "#1976d2" }}>
					{row.id}
				</RouterLink>
			),
		},
		{
			key: "date",
			field: "date",
			headerName: translate("fieldDate"),
			width: 120,
			renderCell: (row) => new Date(row.date).toLocaleDateString("ru-RU"),
		},
		{
			key: "totalDue",
			field: "totalDue",
			headerName: translate("fieldTotalDue"),
			width: 120,
			align: "right",
			renderCell: (row) => row.totalDue,
		},
		{
			key: "totalPaid",
			field: "totalPaid",
			headerName: translate("fieldTotalPaid"),
			width: 120,
			align: "right",
			renderCell: (row) => row.totalPaid.toLocaleString("ru-RU"),
		},
	];

	const consolidated = selectedPartnerStore.filteredTransactions;
	const totalDue =
		consolidated !== "loading" && Array.isArray(consolidated)
			? consolidated.reduce((sum, r) => sum + r.totalDue, 0)
			: 0;
	const totalPaid =
		consolidated !== "loading" && Array.isArray(consolidated)
			? consolidated.reduce((sum, r) => sum + r.totalPaid, 0)
			: 0;

	if (consolidated === "loading") {
		return <Typography sx={{ p: 2 }}>{translate("loading")}…</Typography>;
	}

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
						initialOption={"week"}
						initialFrom={from}
						initialTo={to}
						onChange={onDateChange}
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

			<Box>
				<DataTable<TransactionRecord> rows={consolidated} columns={columns} pagination />

				<Box sx={{ mt: 2, textAlign: "right" }}>
					<Typography variant="subtitle1">
						{translate("totalDue")}: <strong>{totalDue.toLocaleString("ru-RU")}</strong>
					</Typography>
					<Typography variant="subtitle1">
						{translate("totalPaid")}: <strong>{totalPaid.toLocaleString("ru-RU")}</strong>
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default ReportsTab;
