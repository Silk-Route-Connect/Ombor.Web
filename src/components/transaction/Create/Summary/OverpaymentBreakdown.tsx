import React from "react";
import { useTranslation } from "react-i18next";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { OverpaymentDisposition } from "models/transaction";
import { controlSize, designTokens, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";

import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import { ButtonBase } from "@mui/material";

import OutstandingDebtsError from "../OutstandingDebtsError";
import { summaryTextButtonSx } from "./styles";
import SummaryRow from "./SummaryRow";

interface OverpaymentBreakdownProps {
	entry: UseTransactionEntry;
	onOpenSettle: () => void;
}

/**
 * Where a payment above the total goes (business-rules §B, rule 40): this
 * document, the partner's other open debts, then change or an advance. Every
 * amount is a part of «Оплата», so each is unsigned and named «Из них …».
 */
const OverpaymentBreakdown: React.FC<OverpaymentBreakdownProps> = ({ entry, onOpenSettle }) => {
	const { t } = useTranslation();
	const {
		direction,
		total,
		settledSum,
		settleAlloc,
		changeSum,
		leftover,
		useAdvance,
		allDebtsSettled,
		outstanding,
		outstandingFailed,
		retryOutstanding,
		overChoice,
		setOverChoice,
	} = entry;

	return (
		<>
			<SummaryRow
				label={t(`transaction.new.totals.forThis.${direction}`)}
				value={formatCurrency(total)}
			/>
			{settledSum > 0 && (
				<>
					<SummaryRow
						label={
							<>
								{t("transaction.new.totals.settleDebts")} ·{" "}
								<ButtonBase onClick={onOpenSettle} sx={summaryTextButtonSx}>
									{t("transaction.new.totals.edit")}
								</ButtonBase>
							</>
						}
						value={formatCurrency(settledSum)}
					/>
					{settleAlloc
						.filter((a) => a.amount > 0)
						.map((a) => (
							<SummaryRow
								key={a.transactionId}
								sub
								label={formatOptionalNumber(
									outstanding.find((o) => o.id === a.transactionId)?.number,
									t("common.noNumber"),
								)}
								value={formatCurrency(a.amount)}
								valueColor="text.secondary"
							/>
						))}
				</>
			)}
			{useAdvance ? (
				<SummaryRow
					label={t(`transaction.new.totals.advance.${direction}`)}
					value={formatCurrency(leftover)}
					valueColor="info.main"
					bold
				/>
			) : (
				<SummaryRow
					label={t(`transaction.new.totals.changeRow.${direction}`)}
					value={formatCurrency(changeSum)}
					bold
				/>
			)}

			{outstandingFailed && <OutstandingDebtsError onRetry={retryOutstanding} />}
			{outstanding.length > 0 && !allDebtsSettled && (
				<ButtonBase
					onClick={onOpenSettle}
					sx={{
						gap: "8px",
						width: "100%",
						minHeight: controlSize.md.height,
						fontSize: 13,
						fontWeight: 600,
						border: "1px solid",
						borderColor: "primary.main",
						borderRadius: `${radius.md}px`,
						bgcolor: designTokens.primarySoft,
						color: "primary.main",
						"&:hover": { bgcolor: "primary.main", color: "primary.contrastText" },
					}}
				>
					<BalanceOutlinedIcon sx={{ fontSize: 16 }} />
					{t("transaction.new.totals.settleDebtsBtn")}
				</ButtonBase>
			)}
			{allDebtsSettled && (
				<SegmentedControl<OverpaymentDisposition>
					fullWidth
					value={overChoice}
					onChange={setOverChoice}
					options={[
						{ value: "change", label: t("transaction.new.totals.change") },
						{ value: "advance", label: t("transaction.new.totals.advanceToggle") },
					]}
				/>
			)}
		</>
	);
};

export default OverpaymentBreakdown;
