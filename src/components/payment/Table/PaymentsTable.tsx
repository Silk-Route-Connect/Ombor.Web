import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaymentDirectionBadge, PaymentTypeBadge } from "components/payment/PaymentPresentation";
import TablePager from "components/shared/Table/TablePager";
import {
	tableBodyCellSx as bodyCellSx,
	tableHeadCellSx as headCellSx,
	tableRowSx,
} from "components/shared/Table/tableStyles";
import { Loadable } from "helpers/Loading";
import { PaymentRecord } from "models/payment";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

interface PaymentsTableProps {
	rows: Loadable<PaymentRecord[]>;
	isFiltering: boolean;
	onOpen: (payment: PaymentRecord) => void;
}

/**
 * Payments list per the bundle: № · Дата · Тип · Направление · Партнёр /
 * Сотрудник · Касса · Сумма. Payments are immutable — there are no row actions
 * (rule 1); a row opens the full-page detail. Amounts are unsigned (direction is
 * carried by the badge + green/red colour, consistent with the wallet ledger).
 */
export const PaymentsTable: React.FC<PaymentsTableProps> = ({ rows, isFiltering, onOpen }) => {
	const { t } = useTranslation();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset to the first page whenever the filtered set changes.
	useEffect(() => setPage(0), [rows]);

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			{rows.length === 0 ? (
				<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
					<Box
						sx={{
							width: 56,
							height: 56,
							borderRadius: 2,
							mx: "auto",
							mb: 2,
							display: "grid",
							placeItems: "center",
							bgcolor: "grey.50",
							border: 1,
							borderColor: "divider",
							color: "text.disabled",
						}}
					>
						<ReceiptLongOutlinedIcon sx={{ fontSize: 26 }} />
					</Box>
					<Typography variant="h2" sx={{ mb: 0.75 }}>
						{isFiltering ? t("payment.empty.searchTitle") : t("payment.empty.title")}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
					>
						{isFiltering ? t("payment.empty.searchBody") : t("payment.empty.body")}
					</Typography>
				</Box>
			) : (
				<>
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
								{t("payment.table.number")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("payment.table.date")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("payment.table.type")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("payment.table.direction")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("payment.table.party")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("payment.table.wallet")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right", pr: "18px" }}>
								{t("payment.table.amount")}
							</Box>
						</tr>
					</thead>
					<tbody>
						{paged.map((p) => {
							const party = p.partnerName ?? p.employeeName;
							return (
								<Box component="tr" key={p.id} onClick={() => onOpen(p)} sx={tableRowSx}>
									<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
										<Box
											component="span"
											sx={{ ...numericSx, fontWeight: 700, color: "primary.main" }}
										>
											{p.number}
										</Box>
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, ...numericSx, color: "text.secondary" }}>
										{formatDate(p.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<PaymentTypeBadge type={p.type} />
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<PaymentDirectionBadge direction={p.direction} />
									</Box>
									<Box component="td" sx={bodyCellSx}>
										{party ? (
											<Box component="span" sx={{ fontWeight: 600 }}>
												{party}
											</Box>
										) : (
											<Box component="span" sx={{ color: "text.disabled" }}>
												—
											</Box>
										)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<Box
											component="span"
											sx={{
												display: "inline-flex",
												alignItems: "center",
												gap: "7px",
												color: designTokens.gray700,
												whiteSpace: "nowrap",
											}}
										>
											<AccountBalanceWalletOutlinedIcon
												sx={{ fontSize: 14, color: "text.disabled" }}
											/>
											{p.walletName}
										</Box>
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											pr: "18px",
											...numericSx,
											fontWeight: 700,
											fontSize: 15,
											color: p.direction === "Income" ? "success.main" : "error.main",
										}}
									>
										{formatCurrency(p.amount)}
									</Box>
								</Box>
							);
						})}
					</tbody>
					</Box>
					<TablePager
						count={rows.length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={setPage}
						onRowsPerPageChange={(value) => {
							setRowsPerPage(value);
							setPage(0);
						}}
					/>
				</>
			)}
		</Paper>
	);
};

export default PaymentsTable;
