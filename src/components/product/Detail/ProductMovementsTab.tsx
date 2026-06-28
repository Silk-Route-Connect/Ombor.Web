import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { ProductMovement } from "models/product";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

import { cardIconSx, detailTableSx, quantityInSx, quantityOutSx } from "./detailTableSx";
import HistoryEmptyState from "./HistoryEmptyState";
import TransactionKindChip from "./TransactionKindChip";

interface ProductMovementsTabProps {
	/** Newest first, as served. */
	movements: ProductMovement[];
}

const Dash: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * «Движения» per the bundle: the warehouse ledger with the served running
 * balance and the opening-stock summary row. The opening figure is the
 * remainder before the oldest movement (balanceAfter − delta).
 */
export const ProductMovementsTab: React.FC<ProductMovementsTabProps> = ({ movements }) => {
	const { t } = useTranslation();

	const oldest = movements.length > 0 ? movements[movements.length - 1] : null;
	const openingBalance = oldest ? oldest.balanceAfter - oldest.quantity : 0;

	return (
		<DetailCard
			title={t("product.detail.moves.title")}
			icon={<LayersOutlinedIcon sx={cardIconSx} />}
		>
			{movements.length === 0 ? (
				<HistoryEmptyState
					icon={<LayersOutlinedIcon sx={{ fontSize: 22 }} />}
					title={t("product.detail.moves.emptyTitle")}
					body={t("product.detail.moves.emptyBody")}
				/>
			) : (
				<Box component="table" sx={detailTableSx}>
					<thead>
						<tr>
							<th>{t("product.detail.txns.date")}</th>
							<th>{t("product.detail.txns.type")}</th>
							<th>{t("product.detail.table.warehouse")}</th>
							<th className="r">{t("product.detail.moves.in")}</th>
							<th className="r">{t("product.detail.moves.out")}</th>
							<th className="r">{t("product.detail.moves.balance")}</th>
						</tr>
					</thead>
					<tbody>
						{movements.map((movement) => (
							<tr key={movement.id}>
								<td>
									<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
										{formatDate(movement.date)}
									</Box>
								</td>
								<td>
									<TransactionKindChip kind={movement.kind} />
								</td>
								<td>
									<WarehouseLink id={movement.warehouseId} name={movement.warehouseName} />
								</td>
								<td className="r">
									{movement.quantity > 0 ? (
										<Box component="span" sx={quantityInSx}>
											{formatQuantity(movement.quantity)}
										</Box>
									) : (
										<Dash />
									)}
								</td>
								<td className="r">
									{movement.quantity < 0 ? (
										<Box component="span" sx={quantityOutSx}>
											{formatQuantity(Math.abs(movement.quantity))}
										</Box>
									) : (
										<Dash />
									)}
								</td>
								<td className="r">
									<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
										{formatQuantity(movement.balanceAfter)}
									</Box>
								</td>
							</tr>
						))}
						<tr className="total">
							<td colSpan={2}>
								<Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
									{t("product.detail.moves.opening")}
								</Box>
							</td>
							<td></td>
							<td className="r"></td>
							<td className="r"></td>
							<td className="r">
								<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
									{formatQuantity(openingBalance)}
								</Box>
							</td>
						</tr>
					</tbody>
				</Box>
			)}
		</DetailCard>
	);
};

export default ProductMovementsTab;
