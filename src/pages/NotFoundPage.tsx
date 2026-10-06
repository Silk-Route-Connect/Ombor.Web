import React from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { PATHS } from "routing/paths";

/**
 * Catch-all page for unknown routes — rendered inside the app shell so the user
 * keeps the sidebar/topbar and a clear way back, instead of a blank screen. It
 * is the same not-found state a missing record shows (`LoadStateView`).
 */
export default function NotFoundPage() {
	const { t } = useTranslation();

	return (
		<LoadStateView
			state={null}
			notFound={{
				title: t("page.notFound.title"),
				body: t("page.notFound.message"),
				backTo: PATHS.dashboard,
				backLabel: t("page.notFound.back"),
			}}
		/>
	);
}
