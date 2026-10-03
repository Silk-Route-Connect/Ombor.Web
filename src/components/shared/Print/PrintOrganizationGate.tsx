import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isPresent } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Organization } from "models/settings";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

interface PrintOrganizationGateProps {
	/** Renders the document once the business profile (its header) is loaded. */
	children: (organization: Organization) => React.ReactNode;
}

/**
 * Every printed document carries the business header, so a print view waits
 * for the organization profile and shows a failed load as an error with
 * «Повторить» — never a document without its issuer.
 */
export const PrintOrganizationGate: React.FC<PrintOrganizationGateProps> = observer(
	({ children }) => {
		const { t } = useTranslation();
		const { settingsStore } = useStore();

		useEffect(() => {
			void settingsStore.ensureOrganization();
		}, [settingsStore]);

		const organization = settingsStore.organization;
		if (!isPresent(organization)) {
			return (
				<LoadStateView
					state={organization}
					onRetry={() => void settingsStore.ensureOrganization()}
					errorTitle={t("settings.error.loadOrganization")}
					notFound={{
						title: t("print.organizationMissing"),
						backTo: PATHS.settings,
						backLabel: t("print.toSettings"),
					}}
				/>
			);
		}
		return <>{children(organization)}</>;
	},
);

export default PrintOrganizationGate;
