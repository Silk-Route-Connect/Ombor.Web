import React from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import CommitNote from "components/shared/Dialog/Form/CommitNote";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import CheckIcon from "@mui/icons-material/Check";
import { Box } from "@mui/material";

import { POS_CARD_PADDING, posSubmitSx } from "../posStyles";

interface SummarySubmitProps {
	direction: TransactionDirection;
	/** A sale line asks for more than the warehouse holds (shown after a submit attempt). */
	stockError: boolean;
	/** The paying wallet's balance when a supply's tender exceeds it, else null (DR-25). */
	walletShortOf: number | null;
	onSubmit: () => void;
}

/** «Провести продажу / поставку» with what blocks it and the immutability note under it. */
const SummarySubmit: React.FC<SummarySubmitProps> = ({
	direction,
	stockError,
	walletShortOf,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				p: POS_CARD_PADDING,
				borderTop: "1px solid",
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				gap: "12px",
			}}
		>
			{stockError && (
				<Callout tone="danger" role="alert">
					{t("transaction.new.submit.fixQty")}
				</Callout>
			)}
			{walletShortOf !== null && (
				<Callout tone="danger" role="alert">
					{t("transaction.new.pay.overBalance", {
						// An overdrawn wallet has 0 available, never a negative amount in user-facing copy.
						available: formatCurrency(Math.max(0, walletShortOf)),
					})}
				</Callout>
			)}
			<PrimaryButton icon={<CheckIcon />} onClick={onSubmit} fullWidth sx={posSubmitSx}>
				{t(`transaction.new.submit.button.${direction}`)}
			</PrimaryButton>
			<CommitNote
				text={t("transaction.new.submit.commitNote")}
				sx={{ justifyContent: "center", textAlign: "center" }}
			/>
		</Box>
	);
};

export default SummarySubmit;
