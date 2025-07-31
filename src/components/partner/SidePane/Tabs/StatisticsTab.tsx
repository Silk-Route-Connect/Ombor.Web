import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useStore } from "stores/StoreContext";

export interface StatisticsTabProps {
	partnerId: number;
}

export interface MonthlyStat {
	date: string;
	totalDue: number;
	totalPaid: number;
}

export interface SupplierStats {
	monthly: MonthlyStat[];
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ partnerId }) => {
	const { selectedPartnerStore } = useStore();

	useEffect(() => {
		if (partnerId) {
			selectedPartnerStore.getTransactions(null);
		}
	}, [partnerId, selectedPartnerStore]);

	const stats = selectedPartnerStore.supplies; // either "loading" or SupplierStats

	if (stats === "loading") {
		return <Typography sx={{ p: 2 }}>{translate("loading")}…</Typography>;
	}

	const monthlyData: MonthlyStat[] = [];

	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="subtitle2" gutterBottom>
				{translate("chartDueVsPaid")}
			</Typography>
			<ResponsiveContainer width="100%" height={250}>
				<LineChart data={monthlyData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="totalDue" name={translate("totalDue")} stroke="#1976d2" />
					<Line
						type="monotone"
						dataKey="totalPaid"
						name={translate("totalPaid")}
						stroke="#ff5722"
					/>
				</LineChart>
			</ResponsiveContainer>

			<Box sx={{ mt: 4 }}>
				<Typography variant="subtitle2" gutterBottom>
					{translate("chartMonthlyPayments")}
				</Typography>
				<ResponsiveContainer width="100%" height={250}>
					<BarChart data={monthlyData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
						<XAxis dataKey="date" />
						<YAxis />
						<Tooltip />
						<Bar dataKey="totalPaid" name={translate("totalPaid")} fill="#1976d2" />
					</BarChart>
				</ResponsiveContainer>
			</Box>
		</Box>
	);
};

export default StatisticsTab;
