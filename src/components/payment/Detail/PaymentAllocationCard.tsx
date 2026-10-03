import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailLink from "components/shared/Link/DetailLink";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { PaymentAllocationEntry, PaymentAllocationKind, PaymentRecord } from "models/payment";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { designTokens, radius } from "theme";
import { formatEntityId } from "utils/formatEntityId";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Tooltip } from "@mui/material";

const ALLOC_LABEL_KEY: Record<PaymentAllocationKind, string> = {
	TransactionSettlement: "payment.alloc.settlement",
	AdvanceCredit: "payment.alloc.advance",
	ChangeReturn: "payment.alloc.change",
};

const isSupplySide = (a: PaymentAllocationEntry) =>
	a.transactionType === "Supply" || a.transactionType === "SupplyRefund";

/** «Продажа №12» → the settled document (a link), or the advance / change label. */
const AllocationTarget: React.FC<{ allocation: PaymentAllocationEntry; t: TFunction }> = ({
	allocation: a,
	t,
}) => {
	if (a.allocationType === "AdvanceCredit") {
		return <>{t("payment.alloc.advanceTarget")}</>;
	}
	if (a.allocationType === "ChangeReturn") {
		return (
			<Box component="span" sx={{ fontStyle: "italic" }}>
				{t("payment.alloc.change")}
			</Box>
		);
	}
	if (a.transactionId == null) {
		return <>{t("payment.alloc.settlement")}</>;
	}
	const word = a.transactionType
		? t(isSupplySide(a) ? "payment.alloc.supply" : "payment.alloc.sale")
		: t("payment.alloc.txRef");
	const label = `${word} ${formatEntityId(a.transactionId)}`;
	if (a.transactionType == null) {
		return <>{label}</>;
	}
	const to = isSupplySide(a) ? supplyDetailPath(a.transactionId) : saleDetailPath(a.transactionId);
	return <DetailLink to={to}>{label}</DetailLink>;
};

/** «Чем погашено»: where the payment's money went, settled documents linked. */
export const PaymentAllocationCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<PaymentAllocationEntry>[]>(
		() => [
			{
				key: "target",
				headerName: t("payment.detail.allocTarget"),
				sortable: false,
				renderCell: (a) => <AllocationTarget allocation={a} t={t} />,
			},
			{
				key: "type",
				headerName: t("payment.detail.allocType"),
				sortValue: (a) => t(ALLOC_LABEL_KEY[a.allocationType] ?? a.allocationType),
				renderCell: (a) => (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{ALLOC_LABEL_KEY[a.allocationType]
							? t(ALLOC_LABEL_KEY[a.allocationType])
							: a.allocationType}
					</Box>
				),
			},
			{
				key: "amount",
				headerName: t("payment.detail.allocAmount"),
				align: "right",
				sortValue: (a) => a.amount,
				renderCell: (a) => (
					<>
						<MoneyCell value={a.amount} main />
						{a.allocationType === "ChangeReturn" && (
							<Box
								component="span"
								sx={{
									ml: 1,
									fontSize: 11,
									fontWeight: 700,
									textTransform: "uppercase",
									color: "text.secondary",
									bgcolor: designTokens.gray100,
									borderRadius: `${radius.xs}px`,
									px: "6px",
									py: "1px",
								}}
							>
								{t("payment.detail.memoTag")}
							</Box>
						)}
					</>
				),
			},
		],
		[t],
	);

	return (
		<DetailCard
			icon={<ReceiptLongOutlinedIcon sx={detailCardIconSx} />}
			title={t("payment.detail.allocation")}
			count={payment.allocations.length}
			headerExtra={
				<Tooltip title={t("payment.detail.allocationTooltip")} placement="top">
					<InfoOutlinedIcon sx={{ fontSize: 15, color: "text.disabled", cursor: "help" }} />
				</Tooltip>
			}
		>
			<DetailTable<PaymentAllocationEntry>
				rows={payment.allocations}
				columns={columns}
				rowSx={(a) =>
					a.allocationType === "ChangeReturn" ? { bgcolor: designTokens.gray25 } : undefined
				}
			/>
		</DetailCard>
	);
};

export default PaymentAllocationCard;
