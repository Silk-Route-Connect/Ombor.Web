import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import PartnerStatementSheet from "components/partner/Statement/PartnerStatementSheet";
import StatementPeriodFields from "components/partner/Statement/StatementPeriodFields";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import PrintLayout from "components/shared/Print/PrintLayout";
import PrintOrganizationGate from "components/shared/Print/PrintOrganizationGate";
import { isPresent, isReady } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { partnerDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { buildPartnerStatement, parseStatementPeriod } from "utils/partnerStatement";

/**
 * The printable «Акт сверки» of a partner (`/partners/:id/statement?from&to`),
 * built from the same served ledger as the partner's «Журнал» tab. The period
 * lives in the URL so a reload or a shared link reopens the same statement.
 */
const PartnerStatementPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const partnerId = useRouteEntityId();
	const [searchParams, setSearchParams] = useSearchParams();
	const { partnerLedgerStore } = useStore();

	const fromParam = searchParams.get("from");
	const toParam = searchParams.get("to");
	const period = useMemo(() => parseStatementPeriod(fromParam, toParam), [fromParam, toParam]);

	useEffect(() => {
		if (partnerId !== null) {
			void partnerLedgerStore.load(partnerId);
		}
		return () => partnerLedgerStore.clear();
	}, [partnerId, partnerLedgerStore]);

	const partner = partnerId === null ? null : partnerLedgerStore.partner;
	const ledger = partnerLedgerStore.ledger;
	const statement = useMemo(
		() => (isReady(ledger) ? buildPartnerStatement(ledger, period) : null),
		[ledger, period],
	);

	if (partnerId === null || !isPresent(partner) || statement === null) {
		const state = !isPresent(partner) ? partner : isReady(ledger) ? "loading" : ledger;
		return (
			<LoadStateView
				state={state}
				onRetry={() => partnerId !== null && void partnerLedgerStore.load(partnerId)}
				errorTitle={t(isPresent(partner) ? "partner.error.getLedger" : "partner.error.getById")}
				notFound={{ title: t("partner.detail.notFound"), backTo: PATHS.partners }}
			/>
		);
	}

	return (
		<PrintOrganizationGate>
			{(organization) => (
				<PrintLayout
					title={t("print.statement.toolbarTitle", { name: partner.name })}
					backTo={partnerDetailPath(partnerId)}
					toolbar={
						<StatementPeriodFields
							period={period}
							onChange={(next) =>
								setSearchParams({ from: next.from, to: next.to }, { replace: true })
							}
						/>
					}
				>
					<PartnerStatementSheet
						organization={organization}
						partner={partner}
						statement={statement}
					/>
				</PrintLayout>
			)}
		</PrintOrganizationGate>
	);
});

export default PartnerStatementPage;
