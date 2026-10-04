import React from "react";
import { useTranslation } from "react-i18next";
import CommitNote from "components/shared/Dialog/Form/CommitNote";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box } from "@mui/material";

interface SummarySubmitProps {
	direction: TransactionDirection;
	/** A sale line asks for more than the warehouse holds (shown after a submit attempt). */
	stockError: boolean;
	/** The paying wallet's balance when a supply's tender exceeds it, else null (DR-25). */
	walletShortOf: number | null;
	onSubmit: () => void;
}

const SubmitError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		role="alert"
		sx={{
			p: "10px 12px",
			borderRadius: "6px",
			bgcolor: designTokens.errorBg,
			border: "1px solid",
			borderColor: designTokens.errorBorder,
			display: "flex",
			alignItems: "center",
			gap: "7px",
			fontSize: 12,
			color: "error.main",
		}}
	>
		<ErrorOutlineIcon sx={{ fontSize: 13 }} />
		{children}
	</Box>
);

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
				p: "16px 18px",
				borderTop: "1px solid",
				borderColor: "divider",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
			}}
		>
			{stockError && <SubmitError>{t("transaction.new.submit.fixQty")}</SubmitError>}
			{walletShortOf !== null && (
				<SubmitError>
					{t("transaction.new.pay.overBalance", {
						// An overdrawn wallet has 0 available, never a negative amount in user-facing copy.
						available: formatCurrency(Math.max(0, walletShortOf)),
					})}
				</SubmitError>
			)}
			<PrimaryButton
				icon={<CheckIcon />}
				onClick={onSubmit}
				fullWidth
				sx={{ height: 50, fontSize: 15 }}
			>
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
