import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";

interface ArchivedBadgeProps {
	/**
	 * Badge text. Defaults to the shared «Архив» label; pass a module-specific
	 * key when its wording differs (e.g. the partner module's «в архиве»).
	 */
	label?: string;
}

/**
 * Small uppercase «Архив» pill — the single archived cue for list rows and
 * detail headers (neutral chip, readable text).
 */
export const ArchivedBadge: React.FC<ArchivedBadgeProps> = ({ label }) => {
	const { t } = useTranslation();
	return <StatusPill token="neutral" uppercase label={label ?? t("common.archived")} />;
};

export default ArchivedBadge;
