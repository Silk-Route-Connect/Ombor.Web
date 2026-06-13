import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Measurement, ProductTransaction } from "models/product";
import { PATHS } from "routing/paths";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box, Button } from "@mui/material";

import DetailCard from "./DetailCard";
import { cardIconSx, detailTableSx, quantityInSx, quantityOutSx } from "./detailTableSx";
import HistoryEmptyState from "./HistoryEmptyState";
import TransactionKindChip from "./TransactionKindChip";

interface ProductTransactionsTabProps {
	transactions: ProductTransaction[];
	measurement: Measurement;
}

/** «Транзакции» per the bundle: dated history with signed quantities. */
export const ProductTransactionsTab: React.FC<ProductTransactionsTabProps> = ({
	transactions,
	measurement,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const unit = MEASUREMENT_SHORT[measurement];

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
								<th>{t("product.detail.txns.date")}</th>
								<th>{t("product.detail.txns.type")}</th>
								<th>{t("product.detail.txns.partner")}</th>
								<th className="r">{t("product.detail.table.quantity")}</th>
								<th className="r">{t("product.detail.txns.price")}</th>
								<th className="r">{t("product.detail.txns.total")}</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((txn) => (
								<tr key={txn.id}>
									<td>
										<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
											{formatDate(txn.date)}
										</Box>
									</td>
									<td>
										<TransactionKindChip kind={txn.transactionType} />
									</td>
									<td>{txn.partnerName}</td>
									<td className="r">
										<Box component="span" sx={txn.quantity > 0 ? quantityInSx : quantityOutSx}>
											{txn.quantity > 0 ? "+" : "−"}
											{formatQuantity(Math.abs(txn.quantity))} {unit}
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
					<Box sx={{ p: "13px 18px", borderTop: 1, borderColor: "divider" }}>
						<Button
							size="small"
							endIcon={<ChevronRightIcon />}
							onClick={() => navigate(PATHS.sales)}
							sx={{ color: "primary.main", fontWeight: 600, px: "8px" }}
						>
							{t("product.detail.txns.all")}
						</Button>
					</Box>
				</>
			)}
		</DetailCard>
	);
};

export default ProductTransactionsTab;
