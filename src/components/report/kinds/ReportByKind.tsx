import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { ReportKind } from "utils/report/reportQuery";

import { ReportMode } from "../Layout/ReportFrame";
import { buildCashFlowView } from "../views/cashFlowView";
import { buildExpensesView } from "../views/expensesView";
import { buildLossesView } from "../views/lossesView";
import { buildProfitView } from "../views/profitView";
import { buildPurchasesView } from "../views/purchasesView";
import { buildSalesView } from "../views/salesView";
import PeriodReport from "./PeriodReport";
import StockReport from "./StockReport";

/** The report a `/reports/:kind` URL names — its served data paired with its view builder. */
const ReportByKind: React.FC<{ kind: ReportKind; mode: ReportMode }> = observer(
	({ kind, mode }) => {
		const { reportStore: store } = useStore();
		switch (kind) {
			case "sales":
				return (
					<PeriodReport kind={kind} mode={mode} resource={store.sales} build={buildSalesView} />
				);
			case "profit":
				return (
					<PeriodReport kind={kind} mode={mode} resource={store.profit} build={buildProfitView} />
				);
			case "purchases":
				return (
					<PeriodReport
						kind={kind}
						mode={mode}
						resource={store.purchases}
						build={buildPurchasesView}
					/>
				);
			case "cashFlow":
				return (
					<PeriodReport
						kind={kind}
						mode={mode}
						resource={store.cashFlow}
						build={buildCashFlowView}
					/>
				);
			case "expenses":
				return (
					<PeriodReport
						kind={kind}
						mode={mode}
						resource={store.expenses}
						build={buildExpensesView}
					/>
				);
			case "losses":
				return (
					<PeriodReport kind={kind} mode={mode} resource={store.losses} build={buildLossesView} />
				);
			case "stock":
				return <StockReport mode={mode} />;
		}
	},
);

export default ReportByKind;
