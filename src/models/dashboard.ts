export type TimeSeriesPoint = {
	date: string;
	value: number;
};

export type DashboardMetrics = {
	totalSales: number;
	totalSupplies: number;
	netChange: number;
	overdueCount: number;
	salesOverTime: TimeSeriesPoint[];
	suppliesOverTime: TimeSeriesPoint[];
	transactionCount: number;
	refundCount: number;
	outstandingCount: number;
};
