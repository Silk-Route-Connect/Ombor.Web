import React from "react";
import { useTranslation } from "react-i18next";
import { RefundLine, RefundRowCheck, RefundRowDraft } from "hooks/transactions/useRefundForm";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { isQuantityDraft } from "utils/quantityInput";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, ButtonBase, Typography } from "@mui/material";

import { refundBodyCellSx, refundUnitSx } from "./refundTableSx";

interface RefundLineRowProps {
	line: RefundLine;
	draft: RefundRowDraft;
	check: RefundRowCheck;
	onToggle: () => void;
	onQtyChange: (qty: string) => void;
}

/** One original line in the refund modal: pick it, type how many go back, see the line's error. */
const RefundLineRow: React.FC<RefundLineRowProps> = ({
	line,
	draft,
	check,
	onToggle,
	onQtyChange,
}) => {
	const { t } = useTranslation();
	const noneLeft = line.available <= 0;
	const flagged = check.over || check.notWhole;
	const counted = draft.checked && !flagged && check.qty > 0;
	const rowBg = flagged
		? designTokens.errorBg
		: draft.checked
			? designTokens.gray25
			: "transparent";

	return (
		<>
			<Box component="tr" sx={{ "& td": { bgcolor: rowBg } }}>
				<Box component="td" sx={{ ...refundBodyCellSx, textAlign: "left", pl: "16px" }}>
					<ButtonBase
						role="checkbox"
						aria-checked={draft.checked}
						aria-label={t("transaction.refund.selectLine", { name: line.name })}
						onClick={onToggle}
						disableRipple
						sx={{
							width: 20,
							height: 20,
							borderRadius: "6px",
							border: "1.5px solid",
							color: "common.white",
							...(draft.checked
								? { bgcolor: "primary.main", borderColor: "primary.main" }
								: { bgcolor: "background.paper", borderColor: designTokens.borderControl }),
						}}
					>
						{draft.checked && <CheckIcon sx={{ fontSize: 14 }} />}
					</ButtonBase>
				</Box>
				<Box component="td" sx={{ ...refundBodyCellSx, textAlign: "left", fontFamily: "inherit" }}>
					<Typography sx={{ fontWeight: 600, fontSize: 14 }}>{line.name}</Typography>
					{line.disc && (
						<Typography sx={{ fontSize: 12, color: designTokens.saffron700, mt: "2px" }}>
							{t("transaction.refund.discountedPrice", { disc: line.disc })}
						</Typography>
					)}
				</Box>
				<Box component="td" sx={refundBodyCellSx}>
					{line.sold}{" "}
					<Box component="span" sx={refundUnitSx}>
						{line.unit}
					</Box>
				</Box>
				<Box
					component="td"
					sx={{
						...refundBodyCellSx,
						color: line.refunded ? designTokens.gray700 : "text.disabled",
						fontWeight: line.refunded ? 600 : 400,
					}}
				>
					{line.refunded || "—"}
				</Box>
				<Box
					component="td"
					sx={{
						...refundBodyCellSx,
						fontWeight: 700,
						color: noneLeft ? "text.disabled" : "text.primary",
					}}
				>
					{Math.max(line.available, 0)}{" "}
					<Box component="span" sx={refundUnitSx}>
						{line.unit}
					</Box>
				</Box>
				<Box component="td" sx={{ ...refundBodyCellSx, width: 122 }}>
					{draft.checked ? (
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								px: "10px",
								py: "5px",
								ml: "auto",
								maxWidth: 104,
								border: "1px solid",
								borderRadius: "6px",
								bgcolor: flagged ? designTokens.errorBg : "background.paper",
								borderColor: flagged ? "error.main" : designTokens.gray300,
								"&:focus-within": { borderColor: flagged ? "error.main" : "primary.main" },
							}}
						>
							<Box
								component="input"
								inputMode="numeric"
								aria-label={t("transaction.refund.col.toRefund")}
								aria-invalid={flagged}
								value={draft.qty}
								onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
									// Refusing only the «,» keystroke let «1,5» become 15 as the next digit
									// landed; the draft keeps the separator and the row is flagged instead.
									if (isQuantityDraft(ev.target.value)) {
										onQtyChange(ev.target.value);
									}
								}}
								sx={{
									...numericSx,
									width: 44,
									border: "none",
									outline: "none",
									background: "none",
									fontWeight: 700,
									fontSize: 14,
									textAlign: "right",
									fontFamily: "inherit",
									color: flagged ? "error.main" : "text.primary",
								}}
							/>
							<Box component="span" sx={refundUnitSx}>
								{line.unit}
							</Box>
						</Box>
					) : (
						<Box component="span" sx={{ color: "text.disabled" }}>
							—
						</Box>
					)}
				</Box>
				<Box component="td" sx={refundBodyCellSx}>
					{formatCurrency(line.price)}
				</Box>
				<Box
					component="td"
					sx={{
						...refundBodyCellSx,
						fontWeight: 700,
						color: counted ? "text.primary" : "text.disabled",
					}}
				>
					{counted ? formatCurrency(check.amount) : "—"}
				</Box>
			</Box>
			{flagged && (
				<Box component="tr">
					<Box
						component="td"
						colSpan={8}
						sx={{
							p: "0 12px 9px 16px",
							bgcolor: designTokens.errorBg,
							borderBottom: "1px solid",
							borderColor: designTokens.errorBorder,
						}}
					>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								fontSize: 12,
								fontWeight: 600,
								color: "error.main",
							}}
						>
							<ErrorOutlineIcon sx={{ fontSize: 14 }} />
							{check.notWhole
								? t("transaction.new.line.qtyWholeOnly")
								: t("transaction.refund.maxError", {
										max: Math.max(line.available, 0),
										unit: line.unit,
										refunded: line.refunded,
										sold: line.sold,
									})}
						</Box>
					</Box>
				</Box>
			)}
		</>
	);
};

export default RefundLineRow;
