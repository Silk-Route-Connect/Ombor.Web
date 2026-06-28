import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { OutstandingTransaction, SettlementInput } from "models/payment";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import CheckIcon from "@mui/icons-material/Check";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import {
	Box,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	TextField,
	Typography,
} from "@mui/material";

interface PaymentSettlementModalProps {
	isOpen: boolean;
	isSaving: boolean;
	partnerName: string;
	amount: number;
	walletName: string;
	direction: "Income" | "Expense";
	outstanding: OutstandingTransaction[] | "loading";
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
	fontSize: 11.5,
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
	outstanding,
	onBack,
	onConfirm,
}) => {
	const { t } = useTranslation();

	const rowsData = outstanding === "loading" ? [] : outstanding;

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
		const settlements: SettlementInput[] = rows
			.map((r, i) => (r.on && r.amt > 0 ? { transactionId: rowsData[i].id, amount: r.amt } : null))
			.filter((s): s is SettlementInput => s !== null);
		onConfirm(settlements, advance);
	};

	return (
		<Dialog
			open={isOpen}
			onClose={onBack}
			disableEscapeKeyDown={isSaving}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 760, maxWidth: "96%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("payment.settlement.title")}
				subtitle={t("payment.settlement.subtitle", {
					amount: formatCurrency(amount),
					wallet: walletName,
					partner: partnerName,
					kind: t(
						direction === "Expense" ? "payment.settlement.supplies" : "payment.settlement.debts",
					),
				})}
				disabled={isSaving}
				onClose={onBack}
			/>

			<DialogContent dividers sx={{ pt: 2 }}>
				<Box sx={{ mb: "12px" }}>
					<GhostButton
						icon={<SortByAlphaIcon sx={{ fontSize: "16px !important" }} />}
						onClick={() => setRows(buildFifo())}
						sx={{ fontSize: 13, py: "6px" }}
					>
						{t("payment.settlement.auto")}
					</GhostButton>
				</Box>

				{outstanding === "loading" ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
						<CircularProgress size={26} />
					</Box>
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
							<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
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
											<Checkbox
												size="small"
												checked={on}
												onChange={() => toggle(i)}
												sx={{ p: 0 }}
											/>
										</Box>
										<Box component="td" sx={{ ...cellSx, ...numericSx, color: "text.secondary" }}>
											{formatDate(r.date)}
										</Box>
										<Box component="td" sx={cellSx}>
											<Box
												component="span"
												sx={{ ...numericSx, fontWeight: 600, color: "primary.main" }}
											>
												№{r.id}
											</Box>{" "}
											<Box component="span" sx={{ color: "text.secondary", fontSize: 12 }}>
												{t(
													r.type === "Sale"
														? "payment.settlement.sale"
														: "payment.settlement.supply",
												)}
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

				{/* summary */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: "12px",
						mt: "18px",
						p: "14px 16px",
						borderRadius: "8px",
						bgcolor: designTokens.gray25,
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<Box>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							{t("payment.settlement.toDistribute")}
						</Typography>
						<Typography sx={{ ...numericSx, fontWeight: 800, fontSize: 18 }}>
							{formatCurrency(amount)}
						</Typography>
					</Box>
					<Box>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							{t("payment.settlement.distributed")}
						</Typography>
						<Typography sx={{ ...numericSx, fontWeight: 800, fontSize: 18, color: "success.main" }}>
							{formatCurrency(distributed)}
						</Typography>
					</Box>
					<Box>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							{t("payment.settlement.toAdvance")}
						</Typography>
						<Typography
							sx={{
								...numericSx,
								fontWeight: 800,
								fontSize: 18,
								color: advance > 0 ? designTokens.saffron700 : "text.disabled",
							}}
						>
							{formatCurrency(advance)}
						</Typography>
						{advance > 0 && (
							<Typography sx={{ fontSize: 11, color: "text.disabled", mt: "2px" }}>
								{t("payment.settlement.advanceNote")}
							</Typography>
						)}
					</Box>
				</Box>
			</DialogContent>

			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					gap: "10px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<GhostButton onClick={onBack} disabled={isSaving}>
					{t("payment.settlement.back")}
				</GhostButton>
				<PrimaryButton icon={<CheckIcon />} onClick={confirm} disabled={isSaving}>
					{t("payment.settlement.confirm")}
				</PrimaryButton>
			</DialogActions>
		</Dialog>
	);
};

export default PaymentSettlementModal;
