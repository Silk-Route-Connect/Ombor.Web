import React, { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PercentField from "components/shared/Inputs/PercentField";
import { formatPercentInput } from "components/shared/Inputs/percentInput";
import { designTokens } from "theme";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, Typography } from "@mui/material";

interface BulkDiscountBarProps {
	/** The percent last applied to every line, 0 when none. */
	applied: number;
	onApply: (pct: number) => void;
}

/** The cart footer: one percent applied to every line at once. */
export const BulkDiscountBar: React.FC<BulkDiscountBarProps> = ({ applied, onApply }) => {
	const { t } = useTranslation();
	const id = useId();
	const [pct, setPct] = useState(0);

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
					{t("transaction.new.bulk.applied", { pct: formatPercentInput(applied) })}
				</Typography>
			)}
			<PercentField
				id={id}
				value={pct}
				onChange={setPct}
				placeholder="0"
				fullWidth={false}
				sx={{ width: 96 }}
			/>
			<GhostButton onClick={() => onApply(pct)}>{t("transaction.new.bulk.apply")}</GhostButton>
		</Box>
	);
};

export default BulkDiscountBar;
