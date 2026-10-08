import React from "react";
import UzsUnit from "components/shared/Money/UzsUnit";
import { heroShade } from "components/shared/StatCard/statTone";
import { typeScale } from "theme";

import { Box, Typography } from "@mui/material";

import DetailCard from "./DetailCard";

/** Room the «UZS» after the figure takes (14px unit + its 5px gap), with slack. */
const UNIT_ROOM_PX = 44;
const MIN_FONT_PX = 20;

/**
 * Font size that fits `value` on one line of the card: the 32px hero step, scaled
 * down by the figure's width in ems so a long sum («−1 234 567 890,50») never
 * wraps or overflows a 320–360px rail. Digits and signs are ~0.62em in Onest
 * bold, separators ~0.28em.
 */
const fitFontSize = (value: string): string => {
	const ems = [...value].reduce((w, ch) => w + (/[\d−+-]/.test(ch) ? 0.62 : 0.28), 0);
	const max = typeScale.numHero.fontSize;
	return `max(${MIN_FONT_PX}px, min(${max}px, calc((100cqi - ${UNIT_ROOM_PX}px) / ${ems.toFixed(2)})))`;
};

export interface HeroAmountCardProps {
	/** What the figure is («Сумма продажи», «Баланс»). */
	caption: React.ReactNode;
	/** The formatted figure (`formatCurrency`, or a partner's signed balance). */
	value: string;
	/**
	 * Colour of the figure — money semantics stay with the caller (pattern 4,
	 * DR-27). A signal `.main` shade draws in its dark on-tint shade, as StatCard.
	 */
	valueColor?: string;
	/** The line under the figure: a status chip, a direction badge, a one-line reading. */
	status?: React.ReactNode;
	/** Under a hairline: what the figure is made of — a `FactList` of `FactRow`s, a note. */
	children?: React.ReactNode;
}

/**
 * The one big figure of a detail rail — a document's total, a payment's amount,
 * a partner's balance: caption · the 32px figure with «UZS» · an optional status
 * line · the breakdown under a hairline. First card of the rail.
 */
export const HeroAmountCard: React.FC<HeroAmountCardProps> = ({
	caption,
	value,
	valueColor = "text.primary",
	status,
	children,
}) => (
	<DetailCard>
		<Box sx={{ p: "18px", containerType: "inline-size" }}>
			<Typography variant="body2" component="div" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				component="div"
				sx={{
					...typeScale.numHero,
					fontSize: fitFontSize(value),
					lineHeight: 1.15,
					mt: "6px",
					color: heroShade(valueColor),
					whiteSpace: "nowrap",
				}}
			>
				{value}
				<UzsUnit sx={{ fontSize: 14 }} />
			</Typography>
			{status && (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						flexWrap: "wrap",
						gap: 1,
						mt: "10px",
						typography: "body2",
						color: "text.secondary",
					}}
				>
					{status}
				</Box>
			)}
			{children && (
				<Box sx={{ mt: "16px", pt: "8px", borderTop: "1px solid", borderColor: "divider" }}>
					{children}
				</Box>
			)}
		</Box>
	</DetailCard>
);

export default HeroAmountCard;
