import React from "react";
import StatCard from "components/shared/StatCard/StatCard";
import { StatTone } from "components/shared/StatCard/statTone";
import { formatCurrency, formatCurrencyMinus } from "utils/formatCurrency";

import { useCountUp } from "../motion";
import DeltaBadge from "./DeltaBadge";
import KpiSparkline from "./KpiSparkline";
import { KpiCardSpec } from "./types";

interface KpiCardProps {
	spec: KpiCardSpec;
	onOpen: () => void;
}

/** The icon tile takes the colour of the card's trend line. */
const TONE_OF_SPARK: Record<KpiCardSpec["spark"], StatTone> = {
	primary: "primary",
	secondary: "accent",
	success: "success",
	error: "danger",
	warning: "warning",
	info: "info",
};

/**
 * One «Главное» KPI on the shared `StatCard`: the figure counts up, the change
 * badge and footnote sit under it and the sparkline is pinned to the bottom so
 * the cards of a row line up. The whole card opens the module behind it.
 */
export const KpiCard: React.FC<KpiCardProps> = ({ spec, onOpen }) => {
	const animated = useCountUp(spec.value);
	const format = spec.signed ? formatCurrencyMinus : formatCurrency;

	return (
		<StatCard
			icon={spec.icon}
			tone={TONE_OF_SPARK[spec.spark]}
			caption={spec.caption}
			hint={spec.hint}
			// Count-up frames tick in whole sums; the settled value is the exact
			// figure, kopecks included («702,01» — never rounded to «702»).
			value={format(animated === spec.value ? spec.value : Math.trunc(animated))}
			valueColor={spec.valueColor}
			unit="uzs"
			footer={
				<>
					{spec.delta && <DeltaBadge delta={spec.delta} />}
					<span>{spec.footnote}</span>
				</>
			}
			detail={spec.detail}
			chart={<KpiSparkline trend={spec.trend} spark={spec.spark} />}
			onClick={onOpen}
			tooltip={spec.tooltip}
		/>
	);
};

export default KpiCard;
