import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { AdjustmentDirection } from "models/stockAdjustment";

import { directionPresentation } from "./directionPresentation";

/** Stock-adjustment direction: «− Списание» / «+ Приход товара» (see {@link directionPresentation}). */
export const DirectionChip: React.FC<{ direction: AdjustmentDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const { token, icon } = directionPresentation(direction);
	return <StatusPill token={token} icon={icon} label={t(`adjustment.direction.${direction}`)} />;
};

export default DirectionChip;
