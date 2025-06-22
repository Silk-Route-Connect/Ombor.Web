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
import { Payment } from "models/payment";
import { useStore } from "stores/StoreContext";
import { formatDateTime } from "utils/dateUtils";
import { formatPaymentType } from "utils/paymentUtils";
import { formatPrice } from "utils/supplyUtils";

import PaymentAllocationsTable from "../Table/PaymentAllocationTable";

interface IPaymentsTabProps {
	partnerId: number;
}

const PaymentsTab: React.FC<IPaymentsTabProps> = observer(({ partnerId }) => {
	const { selectedPartnerStore } = useStore();

	useEffect(() => {
		if (partnerId) {
			selectedPartnerStore.getPayments();
		}
	}, [partnerId, selectedPartnerStore]);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const menuOpen = Boolean(anchorEl);
	const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	const handleDownloadPDF = () => {
		handleMenuClose();
		console.log("Download as PDF clicked");
	};
	const handleDownloadCSV = () => {
		handleMenuClose();
		console.log("Download as CSV clicked");
	};
	const handleDownloadPNG = () => {
		handleMenuClose();
		console.log("Download as PNG clicked");
	};

	const paymentColumns: Column<Payment>[] = [
		{
			key: "id",
			field: "id",
			headerName: translate("fieldId"),
			width: "5%",
			renderCell: (s) => (
				<Link
					href={`/payments/${s.id}`}
					underline="none"
					sx={{
						color: "#1976d2",
						"&:hover": { textDecoration: "underline" },
					}}
				>
					{s.id}
				</Link>
			),
		},
		{
			key: "type",
			field: "type",
			headerName: translate("fieldPaymentType"),
			align: "right",
			width: "20%",
			sortable: true,
			renderCell: (s) => formatPaymentType(s),
		},
		{
			key: "date",
			field: "date",
			headerName: translate("fieldDate"),
			width: "25%",
			sortable: true,
			renderCell: (s) => formatDateTime(s.date),
		},
		{
			key: "amountLocal",
			field: "amountLocal",
			headerName: translate("fieldAmountLocal"),
			align: "right",
			width: "35%",
			sortable: true,
			renderCell: (s) => formatPrice(s.amountLocal),
		},
		{
			key: "currency",
			field: "currency",
			headerName: translate("fieldCurrency"),
			align: "right",
			width: "15%",
			sortable: true,
			renderCell: (s) => s.currency,
		},
	];

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

			<ExpandableDataTable<Payment>
				rows={selectedPartnerStore.filteredPayments}
				columns={paymentColumns}
				pagination
				canExpand={(p) => p.allocations.length > 1}
				renderExpanded={(sale) => <PaymentAllocationsTable rows={sale.allocations} />}
			/>
		</Box>
	);
});

export default PaymentsTab;
