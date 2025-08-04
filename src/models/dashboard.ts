export type TimeSeriesPoint = {
	date: string;
	[key: string]: number | string;
};

export type TimeSeriesConfig = {
	dataKey: string;
	name: string;
	stroke?: string;
	strokeDasharray?: string;
};

export type DashboardMetrics = {
	totalSales: number;
	totalSupplies: number;
	netChange: number;
	overdueCount: number;
	transactionCount: number;
	refundCount: number;
	outstandingCount: number;
	salesOverTime: TimeSeriesPoint[];
	saleRefundsOverTime: TimeSeriesPoint[];
	suppliesOverTime: TimeSeriesPoint[];
	supplyRefundsOverTime: TimeSeriesPoint[];
};
