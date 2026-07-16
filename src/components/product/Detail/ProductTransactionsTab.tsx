import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import DetailCard from "components/shared/Detail/DetailCard";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import TablePager from "components/shared/Table/TablePager";
import { Measurement, ProductTransaction } from "models/product";
import { numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { unitInline } from "utils/productUtils";

import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box } from "@mui/material";

import { cardIconSx, detailTableSx, quantityInSx, quantityOutSx } from "./detailTableSx";
import HistoryEmptyState from "./HistoryEmptyState";
import TransactionKindChip from "./TransactionKindChip";

interface ProductTransactionsTabProps {
	transactions: ProductTransaction[];
	measurement: Measurement;
}

type SortCol = "date" | "type" | "partner" | "quantity" | "price" | "total";

/** «Транзакции» per the bundle: dated history with signed quantities, sortable
 *  on every column (defaults to date, newest first). */
export const ProductTransactionsTab: React.FC<ProductTransactionsTabProps> = ({
	transactions,
	measurement,
}) => {
	const { t } = useTranslation();
	const unit = unitInline(t, measurement);
	const [sortCol, setSortCol] = useState<SortCol>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const rows = useMemo(() => {
		const accessor = (txn: ProductTransaction): string | number => {
			switch (sortCol) {
				case "date":
					return txn.date;
				case "type":
					return txn.transactionType;
				case "partner":
					return txn.partnerName;
				case "quantity":
					return Math.abs(txn.quantity);
				case "price":
					return txn.unitPrice;
				case "total":
					return Math.abs(txn.quantity) * txn.unitPrice;
				default:
					return "";
			}
		};
		const sorted = [...transactions].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? sorted.reverse() : sorted;
	}, [transactions, sortCol, sortDir]);

	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	return (
		<DetailCard
			title={t("product.detail.txns.title")}
			icon={<SwapHorizOutlinedIcon sx={cardIconSx} />}
		>
			{transactions.length === 0 ? (
				<HistoryEmptyState
					icon={<SwapHorizOutlinedIcon sx={{ fontSize: 22 }} />}
					title={t("product.detail.txns.emptyTitle")}
					body={t("product.detail.txns.emptyBody")}
				/>
			) : (
				<>
					<Box component="table" sx={detailTableSx}>
						<thead>
							<tr>
								<DetailSortHeader
									col="date"
									label={t("product.detail.txns.date")}
									active={sortCol === "date"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="type"
									label={t("product.detail.txns.type")}
									active={sortCol === "type"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="partner"
									label={t("product.detail.txns.partner")}
									active={sortCol === "partner"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="quantity"
									label={t("product.detail.table.quantity")}
									active={sortCol === "quantity"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
								<DetailSortHeader
									col="price"
									label={t("product.detail.txns.price")}
									active={sortCol === "price"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
								<DetailSortHeader
									col="total"
									label={t("product.detail.txns.total")}
									active={sortCol === "total"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
							</tr>
						</thead>
						<tbody>
							{paged.map((txn) => (
								<tr key={txn.id}>
									<td>
										<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
											{formatDateTime(txn.date)}
										</Box>
									</td>
									<td>
										<TransactionKindChip kind={txn.transactionType} />
									</td>
									<td>
										<PartnerLink id={txn.partnerId} name={txn.partnerName} />
									</td>
									<td className="r">
										<Box component="span" sx={txn.quantity > 0 ? quantityInSx : quantityOutSx}>
											{formatQuantity(Math.abs(txn.quantity))}
											{unit ? ` ${unit}` : ""}
										</Box>
									</td>
									<td className="r">
										<Box component="span" sx={numericSx}>
											{formatCurrency(txn.unitPrice)}
										</Box>
									</td>
									<td className="r">
										<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
											{formatCurrency(Math.abs(txn.quantity) * txn.unitPrice)}
										</Box>
									</td>
								</tr>
							))}
						</tbody>
					</Box>
					<TablePager
						count={rows.length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={setPage}
						onRowsPerPageChange={(n) => {
							setRowsPerPage(n);
							setPage(0);
						}}
					/>
				</>
			)}
		</DetailCard>
	);
};

export default ProductTransactionsTab;
