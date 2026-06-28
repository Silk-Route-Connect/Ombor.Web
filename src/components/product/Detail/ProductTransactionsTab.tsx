import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DetailCard from "components/shared/Detail/DetailCard";
import { Measurement, ProductTransaction } from "models/product";
import { PATHS } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { unitInline } from "utils/productUtils";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box, Link } from "@mui/material";

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
	const unit = unitInline(t, measurement);

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
					{/* Warm footer band matching the total-row band of the Stocks /
					    Movements tabs (so all three tabs read identically). */}
					<Box
						sx={{
							px: "18px",
							py: "12px",
							bgcolor: designTokens.gray25,
							borderTop: "1.5px solid",
							borderColor: designTokens.gray300,
						}}
					>
						<Link
							component="button"
							underline="hover"
							onClick={() => navigate(PATHS.sales)}
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "2px",
								color: "primary.main",
								fontSize: 13.5,
								fontWeight: 600,
							}}
						>
							{t("product.detail.txns.all")}
							<ChevronRightIcon sx={{ fontSize: 16 }} />
						</Link>
					</Box>
				</>
			)}
		</DetailCard>
	);
};

export default ProductTransactionsTab;
