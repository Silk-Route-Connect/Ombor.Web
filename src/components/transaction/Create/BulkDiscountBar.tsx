import React, { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { designTokens, numericSx } from "theme";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";

interface BulkDiscountBarProps {
	/** The percent last applied to every line, 0 when none. */
	applied: number;
	onApply: (pct: number) => void;
}

/** The cart footer: one percent applied to every line at once. */
export const BulkDiscountBar: React.FC<BulkDiscountBarProps> = ({ applied, onApply }) => {
	const { t } = useTranslation();
	const id = useId();
	const [pct, setPct] = useState("");

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "12px",
				p: "12px 20px",
				borderTop: "1px dashed",
				borderColor: "divider",
				bgcolor: designTokens.bgSubtle,
				flexWrap: "wrap",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
				<LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
				<Typography
					component="label"
					htmlFor={id}
					variant="subtitle2"
					sx={{ color: designTokens.gray700 }}
				>
					{t("transaction.new.bulk.label")}
				</Typography>
			</Box>
			<Box sx={{ flex: 1 }} />
			{applied > 0 && (
				<Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
					{t("transaction.new.bulk.applied", { pct: applied })}
				</Typography>
			)}
			<TextField
				id={id}
				value={pct}
				placeholder="0"
				onChange={(e) => setPct(e.target.value.replace(/[^\d]/g, ""))}
				sx={{
					width: 96,
					"& .MuiOutlinedInput-input": { textAlign: "right", fontWeight: 600, ...numericSx },
				}}
				slotProps={{
					input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
					htmlInput: { inputMode: "numeric" },
				}}
			/>
			<GhostButton onClick={() => onApply(parseInt(pct, 10) || 0)}>
				{t("transaction.new.bulk.apply")}
			</GhostButton>
		</Box>
	);
};

export default BulkDiscountBar;
