import React from "react";
import { useTranslation } from "react-i18next";

import { kindPresentation, movementKindLabelKey } from "./movementKind";
import StatusPill from "./StatusPill";

/** Stock-movement kind chip — identical on Product and Warehouse «Движения». */
export const MovementKindChip: React.FC<{ kind: string }> = ({ kind }) => {
	const { t } = useTranslation();
	const { token, icon } = kindPresentation(kind);
	return (
		<StatusPill
			token={token}
			icon={icon}
			label={t(movementKindLabelKey(kind), { defaultValue: kind })}
		/>
	);
};

export default MovementKindChip;
