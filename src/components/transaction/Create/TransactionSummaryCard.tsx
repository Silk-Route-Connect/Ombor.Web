import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";

import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Avatar, Box, ButtonBase, InputBase, Typography } from "@mui/material";

import { balancePresentation, initialsOf } from "./saleBalance";
import WalletPicker from "./WalletPicker";

interface TransactionSummaryCardProps {
	entry: UseTransactionEntry;
	wallets: Wallet[];
	/** True when a Supply tender exceeds the paying wallet's balance (hard-block). */
	overWallet: boolean;
	onOpenSettle: () => void;
	onSubmit: () => void;
}

const parseNum = (s: string): number => {
	const n = parseInt(s.replace(/[^\d]/g, ""), 10);
	return Number.isNaN(n) ? 0 : n;
};

const Row: React.FC<{
	label: React.ReactNode;
	value: React.ReactNode;
	valueColor?: string;
	bold?: boolean;
	sub?: boolean;
}> = ({ label, value, valueColor, bold, sub }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			fontSize: sub ? 12.5 : 14,
		}}
	>
		<Box
			component="span"
			sx={{ color: bold ? "text.primary" : "text.secondary", fontWeight: bold ? 700 : 400 }}
		>
			{label}
		</Box>
		<Box
			component="span"
			sx={{
				...numericSx,
				fontWeight: bold ? 800 : 600,
				fontSize: bold ? 15 : "inherit",
				color: valueColor ?? "text.primary",
			}}
		>
			{value}
		</Box>
	</Box>
);

/**
 * Right-column summary shared by New Sale + New Supply: the partner balance card
 * (colour + label, projected balance after the transaction), the
 * Подытог → Скидка → Итого flow, the always-on payment breakdown (debt vs
 * overpayment with settle / change / advance per rule 40), the wallet + amount
 * tender, the immutability note and submit. Labels and the balance/colour
 * direction come from the entry's `direction`.
 */
export const TransactionSummaryCard: React.FC<TransactionSummaryCardProps> = ({
	entry,
	wallets,
	overWallet,
	onOpenSettle,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const {
		direction,
		partner,
		items,
		subtotal,
		discTotal,
		total,
		paid,
		remaining,
		payState,
		settledSum,
		settleAlloc,
		changeSum,
		leftover,
		useAdvance,
		allDebtsSettled,
		outstanding,
		overChoice,
		balanceAfter,
		pay,
		tried,
		hasStockError,
		setPay,
		setOverChoice,
	} = entry;

	const tone = partner ? balancePresentation(partner.balance) : null;
	const afterTone = balancePresentation(balanceAfter);
	const hasItems = items.length > 0;
	const over = payState === "over";

	return (
		<Box
			sx={{
				bgcolor: "background.paper",
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				boxShadow: 1,
				position: "sticky",
				top: 16,
			}}
		>
			{/* partner balance */}
			{partner && tone ? (
				<Box sx={{ p: "16px 18px", borderBottom: "1px solid", borderColor: "divider" }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<Avatar
							sx={{
								width: 40,
								height: 40,
								fontSize: 14,
								fontWeight: 700,
								bgcolor: designTokens.primarySoft,
								color: "primary.main",
							}}
						>
							{initialsOf(partner.name)}
						</Avatar>
						<Box sx={{ minWidth: 0 }}>
							<Typography sx={{ fontSize: 15, fontWeight: 700 }} noWrap>
								{partner.name}
							</Typography>
							{partner.companyName && (
								<Typography sx={{ fontSize: 12.5, color: "text.secondary" }} noWrap>
									{partner.companyName}
								</Typography>
							)}
						</Box>
					</Box>
					<Box sx={{ mt: "14px" }}>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
							{t(tone.labelKey)}
						</Typography>
						<Typography
							sx={{
								...numericSx,
								fontSize: 23,
								fontWeight: 800,
								color: tone.color,
								lineHeight: 1.05,
							}}
						>
							{formatCurrency(Math.abs(partner.balance))}
							<Box
								component="span"
								sx={{ fontSize: 13, fontWeight: 600, color: "text.disabled", ml: "6px" }}
							>
								UZS
							</Box>
						</Typography>
					</Box>
					{hasItems && (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mt: "12px",
								pt: "12px",
								borderTop: "1px dashed",
								borderColor: "divider",
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									fontSize: 12.5,
									color: "text.secondary",
								}}
							>
								<NorthEastIcon sx={{ fontSize: 14, color: "text.disabled" }} />
								{t(`transaction.new.balance.after.${direction}`)}
							</Box>
							<Typography
								sx={{ ...numericSx, fontWeight: 800, fontSize: 16, color: afterTone.color }}
							>
								{formatCurrency(Math.abs(balanceAfter))}
							</Typography>
						</Box>
					)}
				</Box>
			) : (
				<Box
					sx={{
						p: "16px 18px",
						borderBottom: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
						display: "flex",
						alignItems: "center",
						gap: "11px",
						color: "text.secondary",
						fontSize: 13,
					}}
				>
					<PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled" }} />
					{t(`transaction.new.balance.pickPartner.${direction}`)}
				</Box>
			)}

			{/* totals + payment breakdown */}
			<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
				<Row label={t("transaction.new.totals.subtotal")} value={formatCurrency(subtotal)} />
				<Row
					label={t("transaction.new.totals.discount")}
					value={discTotal > 0 ? `−${formatCurrency(discTotal)}` : "—"}
					valueColor={discTotal > 0 ? "error.main" : "text.disabled"}
				/>
				<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
					<Typography sx={{ fontSize: 15, fontWeight: 700 }}>
						{t("transaction.new.totals.total")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 22,
							fontWeight: 800,
							color: "primary.main",
							letterSpacing: "-0.02em",
						}}
					>
						{formatCurrency(total)}
						<Box
							component="span"
							sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "5px" }}
						>
							UZS
						</Box>
					</Typography>
				</Box>

				{hasItems && (
					<>
						<Box sx={{ borderTop: "1px solid", borderColor: "divider", my: "3px" }} />
						<Row
							label={t("transaction.new.totals.payment")}
							value={`${formatCurrency(paid)} UZS`}
							bold
						/>

						{!over ? (
							<Row
								label={t(`transaction.new.totals.remaining.${direction}`)}
								value={formatCurrency(remaining)}
								valueColor={
									remaining > 0
										? direction === "Sale"
											? "warning.main"
											: "error.main"
										: "text.disabled"
								}
							/>
						) : (
							<>
								<Row
									label={t(`transaction.new.totals.forThis.${direction}`)}
									value={`−${formatCurrency(total)}`}
								/>
								{settledSum > 0 && (
									<>
										<Row
											label={
												<>
													{t("transaction.new.totals.settleDebts")}
													<Box
														component="span"
														onClick={onOpenSettle}
														sx={{
															color: "primary.main",
															fontWeight: 600,
															cursor: "pointer",
															"&:hover": { textDecoration: "underline" },
														}}
													>
														{" "}
														· {t("transaction.new.totals.edit")}
													</Box>
												</>
											}
											value={`−${formatCurrency(settledSum)}`}
										/>
										{settleAlloc
											.filter((a) => a.amount > 0)
											.map((a) => (
												<Row
													key={a.transactionId}
													sub
													label={formatEntityId(a.transactionId)}
													value={`−${formatCurrency(a.amount)}`}
													valueColor="text.disabled"
												/>
											))}
									</>
								)}
								{useAdvance ? (
									<Row
										label={t(`transaction.new.totals.advance.${direction}`)}
										value={formatCurrency(leftover)}
										valueColor="info.main"
										bold
									/>
								) : (
									<Row
										label={t("transaction.new.totals.change")}
										value={`${changeSum > 0 ? "−" : ""}${formatCurrency(changeSum)}`}
										bold
									/>
								)}

								{outstanding.length > 0 && !allDebtsSettled && (
									<ButtonBase
										onClick={onOpenSettle}
										sx={{
											mt: "3px",
											gap: "7px",
											width: "100%",
											py: "9px",
											fontSize: 13,
											fontWeight: 600,
											border: "1px solid",
											borderColor: "primary.main",
											borderRadius: "8px",
											bgcolor: designTokens.primarySoft,
											color: "primary.main",
											"&:hover": { bgcolor: "primary.main", color: "primary.contrastText" },
										}}
									>
										<BalanceOutlinedIcon sx={{ fontSize: 15 }} />
										{t("transaction.new.totals.settleDebtsBtn")}
									</ButtonBase>
								)}
								{allDebtsSettled && (
									<Box
										sx={{
											display: "flex",
											mt: "3px",
											p: "3px",
											gap: "2px",
											border: "1px solid",
											borderColor: "divider",
											borderRadius: "6px",
										}}
									>
										{(["change", "advance"] as const).map((choice) => {
											const selected = overChoice === choice;
											return (
												<ButtonBase
													key={choice}
													onClick={() => setOverChoice(choice)}
													sx={{
														flex: 1,
														py: "6px",
														fontSize: 12.5,
														fontWeight: 600,
														borderRadius: "4px",
														color: selected ? "info.main" : "text.secondary",
														bgcolor: selected ? designTokens.infoBg : "transparent",
													}}
												>
													{t(
														choice === "change"
															? "transaction.new.totals.change"
															: "transaction.new.totals.advanceToggle",
													)}
												</ButtonBase>
											);
										})}
									</Box>
								)}
							</>
						)}
					</>
				)}
			</Box>

			{/* payment tender */}
			<Box sx={{ p: "0 18px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
				<Typography sx={{ fontSize: 13, fontWeight: 700, color: designTokens.gray700 }}>
					{t(`transaction.new.pay.label.${direction}`)}
				</Typography>
				<Box sx={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
					<Box sx={{ flex: 3, minWidth: 0 }}>
						<WalletPicker
							value={pay.walletId}
							wallets={wallets}
							onChange={(id) => setPay({ ...pay, walletId: id })}
						/>
					</Box>
					<Box
						sx={{
							flex: 2,
							minWidth: 0,
							display: "flex",
							alignItems: "center",
							gap: "6px",
							px: "12px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							borderRadius: "8px",
							bgcolor: "background.paper",
							"&:focus-within": { borderColor: "primary.main" },
						}}
					>
						<InputBase
							value={pay.amount}
							onChange={(e) => setPay({ ...pay, amount: parseNum(e.target.value) })}
							sx={{
								flex: 1,
								...numericSx,
								fontWeight: 700,
								"& input": { textAlign: "right", p: 0 },
							}}
						/>
						<Box component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
							UZS
						</Box>
					</Box>
				</Box>
				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<Box
						component="span"
						onClick={() => setPay({ ...pay, amount: total })}
						sx={{
							fontSize: 12,
							fontWeight: 600,
							color: "primary.main",
							cursor: "pointer",
							"&:hover": { textDecoration: "underline" },
						}}
					>
						{t("transaction.new.pay.fillAll")}
					</Box>
				</Box>
			</Box>

			{/* submit */}
			<Box
				sx={{
					p: "16px 18px",
					borderTop: "1px solid",
					borderColor: "divider",
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				{tried && hasStockError && hasItems && (
					<Box
						sx={{
							p: "10px 12px",
							borderRadius: "6px",
							bgcolor: designTokens.errorBg,
							border: "1px solid",
							borderColor: designTokens.errorBorder,
							display: "flex",
							alignItems: "center",
							gap: "7px",
							fontSize: 12.5,
							color: "error.main",
						}}
					>
						<ErrorOutlineIcon sx={{ fontSize: 13 }} />
						{t("transaction.new.submit.fixQty")}
					</Box>
				)}
				{tried && overWallet && (
					<Box
						sx={{
							p: "10px 12px",
							borderRadius: "6px",
							bgcolor: designTokens.errorBg,
							border: "1px solid",
							borderColor: designTokens.errorBorder,
							display: "flex",
							alignItems: "center",
							gap: "7px",
							fontSize: 12.5,
							color: "error.main",
						}}
					>
						<ErrorOutlineIcon sx={{ fontSize: 13 }} />
						{t("transaction.new.pay.overBalance", {
							// Clamped like the guard itself — an overdrawn wallet has 0 available,
							// never a negative amount in user-facing copy.
							available: formatCurrency(
								Math.max(0, wallets.find((w) => w.id === pay.walletId)?.balance ?? 0),
							),
						})}
					</Box>
				)}
				<PrimaryButton
					icon={<CheckIcon />}
					onClick={onSubmit}
					fullWidth
					sx={{ height: 50, fontSize: 15 }}
				>
					{t(`transaction.new.submit.button.${direction}`)}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default TransactionSummaryCard;
