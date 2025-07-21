import React from "react";
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
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";

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
			<TableHead sx={{ bgcolor: theme.palette.grey[200] }}>
				<TableRow>
					<TableCell width={48} />
					<TableCell>{translate("payDebts.id")}</TableCell>
					<TableCell>{translate("payDebts.date")}</TableCell>
					<TableCell align="right">{translate("transaction.totalDue")}</TableCell>
					<TableCell align="right">{translate("transaction.totalPaid")}</TableCell>
					<TableCell align="right">{translate("payDebts.leftover")}</TableCell>
					<TableCell align="right" sx={{ width: 150 }}>
						{translate("payDebts.allocate")}
					</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{rows.map((r, i) => {
					const canPayFully = r.leftover <= remainingAvailable + r.allocate;

					return (
						<TableRow key={r.id}>
							<TableCell padding="checkbox">
								<Tooltip title={canPayFully ? "" : translate("payDebts.notEnough")}>
									<span>
										{" "}
										<Checkbox
											checked={r.payFully}
											onChange={() => onToggleFull(i)}
											disabled={!canPayFully}
										/>
									</span>
								</Tooltip>
							</TableCell>

							<TableCell>
								<Link
									href={`/transactions/${r.id}`}
									underline="none"
									sx={{
										color: "#1976d2",
										"&:hover": { textDecoration: "underline" },
									}}
								>
									# {r.id}
								</Link>
							</TableCell>

							<TableCell>{r.date.toLocaleDateString()}</TableCell>
							<TableCell align="right">{r.totalDue.toLocaleString()}</TableCell>
							<TableCell align="right">{r.totalPaid.toLocaleString()}</TableCell>
							<TableCell align="right">{r.leftover.toLocaleString()}</TableCell>

							<TableCell align="right">
								<NumericField
									size="small"
									sx={{ maxWidth: 130 }}
									value={r.allocate}
									onChange={(e) => onAllocateChange(i, Number(e.target.value))}
									error={r.allocate > r.leftover}
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
