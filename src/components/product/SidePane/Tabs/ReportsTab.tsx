// src/components/product/Drawer/ReportsTab.tsx
import React, { useEffect, useRef, useState } from "react";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { toPng } from "html-to-image";
import { translate } from "i18n/i18n";
import jsPDF from "jspdf";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from "recharts";
import theme from "theme";

// Dummy KPI & chart data
const kpiData = [
	{
		key: "totalSales",
		labelKey: "reportTotalSales",
		value: 12500,
		trend: [{ value: 15000 }, { value: 14500 }, { value: 12000 }, { value: 12500 }],
	},
	{
		key: "totalRevenue",
		labelKey: "reportTotalRevenue",
		value: 84200,
		trend: [{ value: 11000 }, { value: 11500 }, { value: 12000 }, { value: 12500 }],
	},
	{
		key: "averageMargin",
		labelKey: "reportAvgMargin",
		value: 32,
		trend: [{ value: 11000 }, { value: 11500 }, { value: 12000 }, { value: 12500 }],
	},
	{
		key: "timesSold",
		labelKey: "reportTimesSold",
		value: 340,
		trend: [{ value: 11000 }, { value: 11500 }, { value: 12000 }, { value: 12500 }],
	},
];

const salesTrend = [
	{ date: "2025-01", sales: 1200, refunds: 50 },
	{ date: "2025-02", sales: 950, refunds: 70 },
	{ date: "2025-03", sales: 1360, refunds: 40 },
	{ date: "2025-04", sales: 1100, refunds: 30 },
	{ date: "2025-05", sales: 1580, refunds: 60 },
];

export function ReportsTab() {
	type RangeOption = "week" | "month" | "custom";
	const [rangeOption, setRangeOption] = useState<RangeOption>("week");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [chartType, setChartType] = useState<"line" | "bar">("line");
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const chartRef = useRef<HTMLDivElement>(null);

	// Compute from/to based on rangeOption
	useEffect(() => {
		const today = new Date();
		const to = today.toISOString().slice(0, 10);
		let from: string;
		if (rangeOption === "week") {
			const d = new Date(today);
			d.setDate(d.getDate() - 7);
			from = d.toISOString().slice(0, 10);
		} else if (rangeOption === "month") {
			const d = new Date(today);
			d.setMonth(d.getMonth() - 1);
			from = d.toISOString().slice(0, 10);
		} else {
			from = fromDate || to;
		}
		setFromDate(from);
		setToDate(to);
	}, [rangeOption]);

	// Reload data when dates change
	useEffect(() => {
		// loadReportData(fromDate, toDate);
	}, [fromDate, toDate]);

	// Download menu handlers
	const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
	const handleCloseMenu = () => setMenuAnchor(null);

	const exportCSV = () => {
		const rows = salesTrend.map((r) => `${r.date},${r.sales},${r.refunds}`).join("\n");
		const csv = `date,sales,refunds\n${rows}`;
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "report.csv";
		a.click();
		URL.revokeObjectURL(url);
		handleCloseMenu();
	};

	const exportPNG = () => {
		if (!chartRef.current) return;
		toPng(chartRef.current).then((dataUrl) => {
			const a = document.createElement("a");
			a.href = dataUrl;
			a.download = "report.png";
			a.click();
		});
		handleCloseMenu();
	};

	const exportPDF = () => {
		if (!chartRef.current) return;
		toPng(chartRef.current).then((dataUrl) => {
			const pdf = new jsPDF();
			const imgProps = pdf.getImageProperties(dataUrl);
			const pdfW = pdf.internal.pageSize.getWidth();
			const pdfH = (imgProps.height * pdfW) / imgProps.width;
			pdf.addImage(dataUrl, "PNG", 0, 0, pdfW, pdfH);
			pdf.save("report.pdf");
		});
		handleCloseMenu();
	};

	return (
		<Box sx={{ p: 2 }}>
			{/* 0) Range selector */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
				<ToggleButtonGroup
					value={rangeOption}
					exclusive
					onChange={(_, v) => v && setRangeOption(v)}
					size="small"
				>
					<ToggleButton value="week">{translate("reportRangeWeek")}</ToggleButton>
					<ToggleButton value="month">{translate("reportRangeMonth")}</ToggleButton>
					<ToggleButton value="custom">{translate("reportRangeCustom")}</ToggleButton>
				</ToggleButtonGroup>
				{rangeOption === "custom" && (
					<>
						<TextField
							label={translate("reportFrom")}
							type="date"
							size="small"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							slotProps={{ inputLabel: { shrink: true } }}
						/>
						<TextField
							label={translate("reportTo")}
							type="date"
							size="small"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							slotProps={{ inputLabel: { shrink: true } }}
						/>
					</>
				)}
			</Box>

			{/* 1) KPI cards */}
			<Grid container spacing={2} sx={{ mb: 3 }}>
				{kpiData.map((kpi) => (
					<Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.key}>
						<Card
							sx={{
								p: 2,
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								bgcolor: "primary.light",
								color: "primary.contrastText",
								borderRadius: 2,
								minHeight: 140,
							}}
						>
							<Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
								{translate(kpi.labelKey)}
							</Typography>

							<Typography variant="h6" sx={{ my: 1, lineHeight: 1 }}>
								{kpi.key === "averageMargin" ? `${kpi.value}%` : kpi.value.toLocaleString("ru-RU")}
							</Typography>

							{/* Sparkline */}
							<Box sx={{ height: 50 }}>
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={kpi.trend} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
										{/* you can hide axes */}
										<XAxis dataKey="value" hide />
										<YAxis hide domain={["dataMin", "dataMax"]} />
										<Line
											type="monotone"
											dataKey="value"
											stroke={theme.palette.primary.contrastText}
											strokeWidth={2}
											dot={false}
										/>
									</LineChart>
								</ResponsiveContainer>
							</Box>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* 2) Chart controls (moved here) */}
			<Box
				sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 1, gap: 2 }}
			>
				<ToggleButtonGroup
					value={chartType}
					exclusive
					onChange={(_, v) => v && setChartType(v)}
					size="small"
				>
					<ToggleButton value="line">
						<ShowChartIcon />
					</ToggleButton>
					<ToggleButton value="bar">
						<BarChartIcon />
					</ToggleButton>
				</ToggleButtonGroup>

				<IconButton onClick={handleOpenMenu} size="small">
					<DownloadIcon />
				</IconButton>
				<Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleCloseMenu}>
					<MenuItem onClick={exportPNG}>{translate("reportExportPNG")}</MenuItem>
					<MenuItem onClick={exportPDF}>{translate("reportExportPDF")}</MenuItem>
					<MenuItem onClick={exportCSV}>{translate("reportExportCSV")}</MenuItem>
				</Menu>
			</Box>

			{/* 3) Sales/Refunds chart */}
			<div ref={chartRef}>
				{chartType === "line" ? (
					<ResponsiveContainer width="100%" height={250}>
						<LineChart data={salesTrend}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
							<XAxis dataKey="date" />
							<YAxis />
							<RechartsTooltip />
							<Line dataKey="sales" name={translate("reportTotalSales")} stroke="#1976d2" />
							<Line dataKey="refunds" name={translate("reportTotalRefunds")} stroke="#ff5722" />
						</LineChart>
					</ResponsiveContainer>
				) : (
					<ResponsiveContainer width="100%" height={250}>
						<BarChart data={salesTrend}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
							<XAxis dataKey="date" />
							<YAxis />
							<RechartsTooltip />
							<Bar dataKey="sales" name={translate("reportTotalSales")} fill="#1976d2" />
							<Bar dataKey="refunds" name={translate("reportTotalRefunds")} fill="#ff5722" />
						</BarChart>
					</ResponsiveContainer>
				)}
			</div>
		</Box>
	);
}
