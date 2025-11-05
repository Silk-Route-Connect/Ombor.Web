import React, { useEffect, useState } from "react";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";
import PayrollApi from "services/api/PayrollApi";
import { formatDateTime } from "utils/dateUtils";

import {
	Alert,
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";

interface PayrollTabProps {
	employeeId: number;
}

const PayrollTab: React.FC<PayrollTabProps> = ({ employeeId }) => {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPayments = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await PayrollApi.getHistory(employeeId);
				setPayments(data);
			} catch (err) {
				setError(translate("employee.payroll.loadError"));
				console.error("Failed to fetch payroll history:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchPayments();
	}, [employeeId]);

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: 400,
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	if (payments.length === 0) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="body2" color="text.secondary" textAlign="center">
					{translate("employee.payroll.noHistory")}
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				{translate("employee.payroll.history")}
			</Typography>

			<TableContainer component={Paper} sx={{ mt: 2 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>{translate("payment.date")}</TableCell>
							<TableCell align="right">{translate("payment.amount")}</TableCell>
							<TableCell>{translate("payment.currency")}</TableCell>
							<TableCell>{translate("payment.method")}</TableCell>
							<TableCell>{translate("payment.notes")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{payments.map((payment) => {
							const primaryComponent = payment.components[0];
							return (
								<TableRow key={payment.id} hover>
									<TableCell>{formatDateTime(payment.date)}</TableCell>
									<TableCell align="right">{payment.amount.toLocaleString()}</TableCell>
									<TableCell>{primaryComponent?.currency ?? translate("common.dash")}</TableCell>
									<TableCell>
										{primaryComponent?.method
											? translate(`payment.method.${primaryComponent.method}`)
											: translate("common.dash")}
									</TableCell>
									<TableCell>
										<Typography
											variant="body2"
											sx={{
												maxWidth: 200,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{payment.notes || "—"}
										</Typography>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 2 }}>
				<Typography variant="body2" color="text.secondary">
					{translate("employee.payroll.totalPayments")}: {payments.length}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{translate("employee.payroll.totalAmount")}:{" "}
					{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
				</Typography>
			</Box>
		</Box>
	);
};

export default PayrollTab;
