import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { StatTone } from "components/shared/StatCard/statTone";
import { PaymentDirectionCounts, PaymentDirectionFilter } from "stores/PaymentStore";
import { formatQuantity } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

interface PaymentDirectionCardsProps {
	/** Null while the list is loading or failed — the cards show «—», never a fake 0. */
	counts: PaymentDirectionCounts | null;
	value: PaymentDirectionFilter;
	onChange: (direction: PaymentDirectionFilter) => void;
}

const CARDS: Array<{
	direction: PaymentDirectionFilter;
	captionKey: string;
	count: keyof PaymentDirectionCounts;
	icon: React.ReactNode;
	tone: StatTone;
	activeColor: string;
}> = [
	{
		direction: "all",
		captionKey: "payment.summary.all",
		count: "all",
		icon: <ReceiptLongOutlinedIcon />,
		tone: "primary",
		activeColor: "primary.main",
	},
	{
		direction: "Income",
		captionKey: "payment.summary.income",
		count: "income",
		icon: <ArrowDownwardIcon />,
		tone: "success",
		activeColor: "success.main",
	},
	{
		direction: "Expense",
		captionKey: "payment.summary.expense",
		count: "expense",
		icon: <ArrowUpwardIcon />,
		tone: "danger",
		activeColor: "error.main",
	},
];

/**
 * «Все платежи · Приход · Расход» — the payments list's one direction filter.
 * Each card counts the payments it would show under the other filters (period,
 * search, type, wallet); the sums live only in the table's totals band, so the
 * page states each money figure once.
 */
export const PaymentDirectionCards: React.FC<PaymentDirectionCardsProps> = ({
	counts,
	value,
	onChange,
}) => {
	const { t } = useTranslation();

	return (
		<StatCardGrid columns={3} label={t("payment.summary.label")}>
			{CARDS.map((card) => (
				<StatCard
					key={card.direction}
					icon={card.icon}
					tone={card.tone}
					caption={t(card.captionKey)}
					value={counts ? formatQuantity(counts[card.count]) : t("common.dash")}
					onClick={() => onChange(card.direction)}
					active={value === card.direction}
					activeColor={card.activeColor}
				/>
			))}
		</StatCardGrid>
	);
};

export default PaymentDirectionCards;
