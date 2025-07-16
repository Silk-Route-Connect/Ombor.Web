import React, { useEffect, useMemo, useState } from "react";
import BoltIcon from "@mui/icons-material/Bolt";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";

import DebtPaymentSummary from "./DebtPaymentSummary";
import DebtsTable, { PayDebtRow } from "./DebtsTable";

export type DebtAllocation = { transactionId: number; amount: number };

interface Props {
	open: boolean;
	availableAmount: number; // remainingAdvance + alreadyAllocated
	initialAllocations: DebtAllocation[];
	onClose: () => void;
	onApply: (allocs: DebtAllocation[]) => void;
}

const PayDebtsModal: React.FC<Props> = observer(
	({ open, availableAmount, initialAllocations, onClose, onApply }) => {
		const { selectedPartnerStore } = useStore();
		const debts: Loadable<TransactionRecord[]> = selectedPartnerStore.openTransactions;

		const baseRows = useMemo<PayDebtRow[]>(() => {
			if (debts === "loading") return [];
			return debts.map((d) => ({
				id: d.id,
				date: new Date(d.date),
				totalDue: d.totalDue,
				totalPaid: d.totalPaid,
				leftover: d.totalDue - d.totalPaid,
				allocate: 0,
				payFully: false,
			}));
		}, [debts]);

		const mergedRows = useMemo<PayDebtRow[]>(() => {
			if (!open) return [];
			return baseRows.map((r) => {
				const prev = initialAllocations.find((a) => a.transactionId === r.id);
				if (!prev) return r;
				return {
					...r,
					allocate: prev.amount,
					payFully: prev.amount === r.leftover,
				};
			});
		}, [open, baseRows, initialAllocations]);

		const [rows, setRows] = useState<PayDebtRow[]>([]);
		useEffect(() => {
			if (open) setRows(mergedRows);
		}, [mergedRows, open]);

		const totalCovered = rows.reduce((s, r) => s + r.allocate, 0);
		const totalDebt = rows.reduce((s, r) => s + r.leftover, 0);

		const remainingAvailable = availableAmount - totalCovered;
		const overAllocate = remainingAvailable < 0;
		const debtLeft = Math.max(totalDebt - totalCovered, 0);

		const canSave =
			totalCovered === 0 || (!overAllocate && (remainingAvailable === 0 || debtLeft === 0));

		const setRow = (i: number, patch: Partial<PayDebtRow>) =>
			setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

		const togglePayFully = (i: number) => {
			const r = rows[i];
			const max = Math.min(r.leftover, remainingAvailable + r.allocate);
			const newAlloc = r.payFully ? 0 : max;
			setRow(i, { payFully: !r.payFully, allocate: newAlloc });
		};

		const changeAllocate = (idx: number, value: number) => {
			const v = Math.max(
				0,
				Math.min(value, rows[idx].leftover, remainingAvailable + rows[idx].allocate),
			);
			setRow(idx, { allocate: v, payFully: v === rows[idx].leftover });
		};

		const autoAllocateOldest = () => {
			let rest = remainingAvailable;
			const ordered = [...rows].sort((a, b) => a.date.getTime() - b.date.getTime());
			const next = ordered.map((r) => {
				const alloc = Math.min(r.leftover, rest);
				rest -= alloc;
				return { ...r, allocate: alloc, payFully: alloc === r.leftover };
			});

			next.sort(
				(a, b) => rows.findIndex((x) => x.id === a.id) - rows.findIndex((x) => x.id === b.id),
			);
			setRows(next);
		};

		const reset = () => {
			const restored = rows.map((el) => {
				return { ...el, allocate: 0, payFully: false };
			});

			setRows(restored);
		};

		const apply = () => {
			const allocs = rows
				.filter((r) => r.allocate > 0)
				.map((r) => ({ transactionId: r.id, amount: r.allocate }));
			onApply(allocs);
		};

		return (
			<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
				<DialogTitle sx={{ p: 2, position: "relative" }}>
					<IconButton
						size="small"
						onClick={onClose}
						sx={{ position: "absolute", top: 8, right: 8 }}
					>
						<CloseIcon />
					</IconButton>

					<Typography variant="h6">{translate("payDebts.title")}</Typography>
					<Divider sx={{ mt: 1 }} />
				</DialogTitle>

				<DialogContent
					sx={{
						p: 2,
						display: "flex",
						flexDirection: "column",
						gap: 2,
					}}
				>
					<Stack direction="row" spacing={2}>
						<Button
							variant="outlined"
							size="small"
							onClick={autoAllocateOldest}
							startIcon={<BoltIcon />}
						>
							{translate("payDebts.autoAllocateOldest")}
						</Button>
						<Button variant="outlined" size="small" onClick={reset} startIcon={<RestartAltIcon />}>
							{translate("payDebts.reset")}
						</Button>
					</Stack>

					<Paper variant="outlined" sx={{ p: 0, height: 325, overflow: "auto" }}>
						<DebtsTable
							loading={debts === "loading"}
							rows={rows}
							remainingAvailable={remainingAvailable}
							onToggleFull={togglePayFully}
							onAllocateChange={changeAllocate}
						/>
					</Paper>

					<DebtPaymentSummary
						totalDebt={totalDebt}
						totalCovered={totalCovered}
						remainingAvailable={remainingAvailable}
						debtLeft={debtLeft}
						overAllocate={overAllocate}
					/>
				</DialogContent>

				<DialogActions sx={{ p: 2 }}>
					<Button onClick={onClose} startIcon={<CloseIcon />}>
						{translate("cancel")}
					</Button>
					<Button variant="contained" startIcon={<DoneIcon />} disabled={!canSave} onClick={apply}>
						{translate("payDebts.apply")}
					</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default PayDebtsModal;
