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
	salesOverTime: TimeSeriesPoint[];
	saleRefundsOverTime: TimeSeriesPoint[];
	suppliesOverTime: TimeSeriesPoint[];
	supplyRefundsOverTime: TimeSeriesPoint[];
	transactionCount: number;
	refundCount: number;
	outstandingCount: number;
};
