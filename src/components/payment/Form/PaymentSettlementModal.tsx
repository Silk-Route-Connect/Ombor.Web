import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isReady, Loadable, readyOr } from "helpers/Loading";
import { OutstandingTransaction, SettlementInput } from "models/payment";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";

import CheckIcon from "@mui/icons-material/Check";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import { Box, Checkbox, TextField, Typography } from "@mui/material";

import SettlementSummary from "./SettlementSummary";

interface PaymentSettlementModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partnerName: string;
	amount: number;
	walletName: string;
	direction: "Income" | "Expense";
	/**
	 * `commit` (a standalone payment): the confirm books the payment.
	 * `apply` (the POS overpayment): the confirm only applies the split to the
	 * cart — nothing is saved until the sale / supply itself is booked.
	 */
	mode?: "commit" | "apply";
	outstanding: Loadable<OutstandingTransaction[]>;
	/** Re-runs a failed open-debts load. */
	onRetry?: () => void;
	onBack: () => void;
	onConfirm: (settlements: SettlementInput[], advance: number) => void;
}

type Row = { on: boolean; amt: number };

const parseAmt = (v: string): number => {
	const n = parseInt(v.replace(/[^\d]/g, ""), 10);
	return Number.isNaN(n) ? 0 : n;
};

const cellSx = {
	p: "11px 14px",
	borderBottom: "1px solid",
	borderColor: designTokens.gray25,
	fontSize: 13,
	verticalAlign: "middle",
} as const;

const headSx = {
	...cellSx,
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	bgcolor: designTokens.gray25,
} as const;

/**
 * Standalone settlement modal (business-rules §B): distribute a payment across
 * the partner's open transactions, FIFO auto-allocate, or distribute manually.
 * Anything left over becomes a partner advance (AdvanceCredit). Opened on submit
 * of an «Оплата» payment.
 */
export const PaymentSettlementModal: React.FC<PaymentSettlementModalProps> = ({
	isOpen,
	isSaving,
	partnerName,
	amount,
	walletName,
	direction,
	mode = "commit",
	outstanding,
	onRetry,
	onBack,
	onConfirm,
}) => {
	const { t } = useTranslation();
	const applyOnly = mode === "apply";

	const rowsData = useMemo(() => readyOr(outstanding, []), [outstanding]);

	const buildFifo = useMemo(
		() => (): Row[] => {
			let left = amount;
			return rowsData.map((r) => {
				const a = Math.min(r.remaining, Math.max(0, left));
				left -= a;
				return { on: a > 0, amt: a };
			});
		},
		[rowsData, amount],
	);

	const [rows, setRows] = useState<Row[]>(buildFifo);

	// Rebuild allocations whenever the outstanding set or amount changes.
	React.useEffect(() => {
		setRows(buildFifo());
	}, [buildFifo]);

	const debtsReady = isReady(outstanding);
	const distributed = rows.reduce((s, r) => s + (r.on ? r.amt : 0), 0);
	const advance = Math.max(0, amount - distributed);

	const setAmt = (i: number, val: string) => {
		const v0 = parseAmt(val);
		setRows((cur) => {
			const others = cur.reduce((s, x, j) => s + (j !== i && x.on ? x.amt : 0), 0);
			const cap = Math.min(rowsData[i].remaining, Math.max(0, amount - others));
			return cur.map((x, j) => (j === i ? { on: true, amt: Math.max(0, Math.min(v0, cap)) } : x));
		});
	};
	const toggle = (i: number) =>
		setRows((cur) => cur.map((x, j) => (j === i ? { on: !x.on, amt: !x.on ? x.amt : 0 } : x)));

	const confirm = () => {
		// Until the open debts are in, confirming would book the whole amount as an
		// advance — the list area shows the spinner / error with «Повторить» instead.
		if (!debtsReady) {
			return;
		}
		const settlements: SettlementInput[] = rows
			.map((r, i) => (r.on && r.amt > 0 ? { transactionId: rowsData[i].id, amount: r.amt } : null))
			.filter((s): s is SettlementInput => s !== null);
		onConfirm(settlements, advance);
	};

	return (
		<FormDialog
			open={isOpen}
			size="lg"
			busy={isSaving}
			onClose={onBack}
			tile={recordTile("Payment")}
			title={t("payment.settlement.title")}
			subtitle={t(applyOnly ? "payment.settlement.subtitleApply" : "payment.settlement.subtitle", {
				amount: formatCurrency(amount),
				wallet: walletName,
				partner: partnerName,
				kind: t(
					direction === "Expense" ? "payment.settlement.supplies" : "payment.settlement.debts",
				),
			})}
			footer={
				<FormDialogFooter
					canSave={!isSaving}
					loading={isSaving}
					onCancel={onBack}
					onSave={confirm}
					cancelLabel={t("payment.settlement.back")}
					submitLabel={t(applyOnly ? "payment.settlement.apply" : "payment.settlement.confirm")}
					submitIcon={<CheckIcon />}
					commitNote={applyOnly ? undefined : t("payment.form.commitNote")}
					summary={
						applyOnly ? (
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								{t("payment.settlement.applyHint")}
							</Typography>
						) : undefined
					}
				/>
			}
		>
			<Box sx={{ mb: "12px" }}>
				<GhostButton
					icon={<SortByAlphaIcon />}
					onClick={() => setRows(buildFifo())}
					sx={{ fontSize: 13, py: "6px" }}
				>
					{t("payment.settlement.auto")}
				</GhostButton>
			</Box>

			{!isReady(outstanding) ? (
				<LoadStateView
					state={outstanding}
					size="section"
					onRetry={onRetry}
					errorTitle={t("payment.settlement.loadFailed")}
				/>
			) : rowsData.length === 0 ? (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "14px",
						p: "22px 4px",
					}}
				>
					<CheckIcon sx={{ fontSize: 22, color: "success.main" }} />
					<Box>
						<Typography sx={{ fontWeight: 700 }}>{t("payment.settlement.emptyTitle")}</Typography>
						<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
							{t("payment.settlement.emptyBody")}
						</Typography>
					</Box>
				</Box>
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<Box component="th" sx={{ ...headSx, width: 40 }} />
							<Box component="th" sx={headSx}>
								{t("payment.settlement.date")}
							</Box>
							<Box component="th" sx={headSx}>
								{t("payment.settlement.transaction")}
							</Box>
							<Box component="th" sx={{ ...headSx, textAlign: "right" }}>
								{t("payment.settlement.total")}
							</Box>
							<Box component="th" sx={{ ...headSx, textAlign: "right" }}>
								{t("payment.settlement.paid")}
							</Box>
							<Box component="th" sx={{ ...headSx, textAlign: "right" }}>
								{t("payment.settlement.remaining")}
							</Box>
							<Box component="th" sx={{ ...headSx, textAlign: "right" }}>
								{t("payment.settlement.allocate")}
							</Box>
						</tr>
					</thead>
					<tbody>
						{rowsData.map((r, i) => {
							const on = rows[i]?.on ?? false;
							return (
								<Box component="tr" key={r.id} sx={{ opacity: on ? 1 : 0.5 }}>
									<Box component="td" sx={cellSx}>
										<Checkbox size="small" checked={on} onChange={() => toggle(i)} sx={{ p: 0 }} />
									</Box>
									<Box component="td" sx={{ ...cellSx, ...numericSx, color: "text.secondary" }}>
										{formatDate(r.date)}
									</Box>
									<Box component="td" sx={cellSx}>
										<Box
											component="span"
											sx={{ ...numericSx, fontWeight: 600, color: "primary.main" }}
										>
											{formatOptionalNumber(r.number, t("common.noNumber"))}
										</Box>{" "}
										<Box component="span" sx={{ color: "text.secondary", fontSize: 12 }}>
											{t(`common.movementKind.${r.type}`)}
										</Box>
									</Box>
									<Box component="td" sx={{ ...cellSx, textAlign: "right", ...numericSx }}>
										{formatCurrency(r.total)}
									</Box>
									<Box
										component="td"
										sx={{ ...cellSx, textAlign: "right", ...numericSx, color: "text.secondary" }}
									>
										{r.paid ? formatCurrency(r.paid) : "—"}
									</Box>
									<Box
										component="td"
										sx={{ ...cellSx, textAlign: "right", ...numericSx, color: "error.main" }}
									>
										{formatCurrency(r.remaining)}
									</Box>
									<Box component="td" sx={{ ...cellSx, textAlign: "right" }}>
										<TextField
											size="small"
											value={rows[i]?.amt ? rows[i].amt.toLocaleString("ru-RU") : "0"}
											disabled={!on}
											onChange={(e) => setAmt(i, e.target.value)}
											sx={{ width: 130, "& input": { textAlign: "right", ...numericSx } }}
										/>
									</Box>
								</Box>
							);
						})}
					</tbody>
				</Box>
			)}

			<SettlementSummary
				amount={amount}
				distributed={distributed}
				advance={advance}
				debtsReady={debtsReady}
				restGoesToAdvance={!applyOnly}
			/>
		</FormDialog>
	);
};

export default PaymentSettlementModal;
