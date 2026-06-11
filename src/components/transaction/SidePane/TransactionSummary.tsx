import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionRecord } from "models/transaction";
import { formatDateTime } from "utils/dateUtils";
import { formatPrice } from "utils/formatCurrency";
import { getPratnerTranslationKey } from "utils/translationUtils";

import { Box, Chip, Grid, Link, Typography } from "@mui/material";

const getStatusColor = (status: string) => {
	switch (status) {
		case "Closed":
			return "success";
		case "Open":
		case "PartiallyPaid":
			return "warning";
		case "Overdue":
			return "error";
		default:
			return "default";
	}
};

interface Props {
	transaction: TransactionRecord;
}

const TransactionSummary: React.FC<Props> = ({ transaction }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ p: 2, pb: 1 }}>
			<Grid container columnSpacing={2} rowSpacing={1.5}>
				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t(getPratnerTranslationKey(transaction.type))}
					</Typography>
					<Link href={`/partners/${transaction.partnerId}`} underline="hover">
						{transaction.partnerName}
					</Link>
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("transaction.date")}
					</Typography>
					{formatDateTime(transaction.date)}
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("transaction.status")}
					</Typography>
					<Chip
						label={t(`transaction.status.${transaction.status}`)}
						size="small"
						color={getStatusColor(transaction.status)}
					/>
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("transaction.totalDue")}
					</Typography>
					{formatPrice(transaction.totalDue)}
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("transaction.totalPaid")}
					</Typography>
					{formatPrice(transaction.totalPaid)}
				</Grid>

				<Grid size={{ xs: 12, sm: 4 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("transaction.leftover")}
					</Typography>
					{formatPrice(transaction.totalDue - transaction.totalPaid)}
				</Grid>

				{transaction.notes && (
					<Grid size={{ xs: 12 }}>
						<Typography variant="subtitle2" color="text.secondary">
							{t("fieldNotes")}
						</Typography>
						<Typography>{transaction.notes}</Typography>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default TransactionSummary;
