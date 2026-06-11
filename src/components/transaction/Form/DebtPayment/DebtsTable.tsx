import React from "react";
import { useTranslation } from "react-i18next";
import NumericField from "components/shared/Inputs/NumericField";

import {
	Box,
	Checkbox,
	CircularProgress,
	Link,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	useTheme,
} from "@mui/material";

export type PayDebtRow = {
	id: number;
	date: Date;
	totalDue: number;
	totalPaid: number;
	leftover: number;
	allocate: number;
	payFully: boolean;
};

interface DebtsTableProps {
	loading: boolean;
	rows: PayDebtRow[];
	remainingAvailable: number;
	onToggleFull: (index: number) => void;
	onAllocateChange: (index: number, value: number) => void;
}

const DebtsTable: React.FC<DebtsTableProps> = ({
	loading,
	rows,
	remainingAvailable,
	onToggleFull,
	onAllocateChange,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress size={24} />
			</Box>
		);
	}

	return (
		<Table stickyHeader size="small">
			<TableHead sx={{ bgcolor: theme.palette.background.default }}>
				<TableRow>
					<TableCell width={48} />
					<TableCell>{t("payDebts.id")}</TableCell>
					<TableCell>{t("payDebts.date")}</TableCell>
					<TableCell align="right">{t("transaction.totalDue")}</TableCell>
					<TableCell align="right">{t("transaction.totalPaid")}</TableCell>
					<TableCell align="right">{t("payDebts.leftover")}</TableCell>
					<TableCell align="right" sx={{ width: 150 }}>
						{t("payDebts.allocate")}
					</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{rows.map((r, i) => {
					const canPayFully = r.leftover <= remainingAvailable + r.allocate;

					return (
						<TableRow key={r.id}>
							{/* checkbox */}
							<TableCell padding="checkbox">
								<Tooltip title={canPayFully ? "" : t("payDebts.notEnough")}>
									<span>
										<Checkbox
											checked={r.payFully}
											onChange={() => onToggleFull(i)}
											disabled={!canPayFully}
										/>
									</span>
								</Tooltip>
							</TableCell>

							{/* id */}
							<TableCell>
								<Link
									href={`/transactions/${r.id}`}
									underline="none"
									sx={{
										color: "#1976d2",
										"&:hover": { textDecoration: "underline" },
									}}
								>
									#{r.id}
								</Link>
							</TableCell>

							<TableCell>{r.date.toLocaleDateString()}</TableCell>
							<TableCell align="right">{r.totalDue.toLocaleString()}</TableCell>
							<TableCell align="right">{r.totalPaid.toLocaleString()}</TableCell>
							<TableCell align="right">{r.leftover.toLocaleString()}</TableCell>

							{/* allocate numeric input */}
							<TableCell align="right">
								<NumericField
									size="small"
									sx={{ maxWidth: 130, textAlign: "right" }}
									value={r.allocate}
									onChange={(e) => onAllocateChange(i, Number(e.target.value))}
									error={r.allocate > r.leftover}
									inputProps={{ inputMode: "decimal" }}
								/>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export default DebtsTable;
