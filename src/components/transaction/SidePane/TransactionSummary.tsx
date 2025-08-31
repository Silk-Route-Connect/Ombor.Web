import React from "react";
import { Box, Chip, Grid, Link, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { TransactionRecord } from "models/transaction";
import { formatDateTime } from "utils/dateUtils";
import { formatPrice } from "utils/supplyUtils";
import { getPratnerTranslationKey } from "utils/translationUtils";

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

const TransactionSummary: React.FC<Props> = ({ transaction }) => (
	<Box sx={{ p: 2, pb: 1 }}>
		<Grid container columnSpacing={2} rowSpacing={1.5}>
			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate(getPratnerTranslationKey(transaction.type))}
				</Typography>
				<Link href={`/partners/${transaction.partnerId}`} underline="hover">
					{transaction.partnerName}
				</Link>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("transaction.date")}
				</Typography>
				{formatDateTime(transaction.date)}
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("transaction.status")}
				</Typography>
				<Chip
					label={translate(`transaction.status.${transaction.status}`)}
					size="small"
					color={getStatusColor(transaction.status)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("transaction.totalDue")}
				</Typography>
				{formatPrice(transaction.totalDue)}
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("transaction.totalPaid")}
				</Typography>
				{formatPrice(transaction.totalPaid)}
			</Grid>

			<Grid size={{ xs: 12, sm: 4 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("transaction.leftover")}
				</Typography>
				{formatPrice(transaction.totalDue - transaction.totalPaid)}
			</Grid>

			{transaction.notes && (
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{translate("fieldNotes")}
					</Typography>
					<Typography>{transaction.notes}</Typography>
				</Grid>
			)}
		</Grid>
	</Box>
);

export default TransactionSummary;
