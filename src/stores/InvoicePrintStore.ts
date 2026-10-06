import { Loadable, toDetailLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import OrderApi from "services/api/OrderApi";
import PartnerApi from "services/api/PartnerApi";
import TransactionApi from "services/api/TransactionApi";
import {
	InvoiceDocument,
	invoiceFromOrder,
	invoiceFromTransaction,
	InvoiceSource,
} from "utils/invoiceDocument";

export interface IInvoicePrintStore {
	/** The document on the print view; `null` when it (or its partner) does not exist. */
	invoice: Loadable<InvoiceDocument | null>;

	load(source: InvoiceSource, id: number): Promise<void>;
	clear(): void;
}

/**
 * State of the invoice print view («Накладная»): the sale / supply / refund or
 * order loaded by id together with its partner (phones and address go on the
 * paper), mapped into one {@link InvoiceDocument} the sheet renders.
 */
export class InvoicePrintStore implements IInvoicePrintStore {
	private readonly loads = new LoadSequence();

	invoice: Loadable<InvoiceDocument | null> = "loading";

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(source: InvoiceSource, id: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => (this.invoice = "loading"));

		const result = await tryRun(() =>
			source === "Order" ? this.fetchOrder(id) : this.fetchTransaction(id),
		);
		if (!isCurrent()) {
			return;
		}
		runInAction(() => (this.invoice = toDetailLoadable(result)));
	}

	clear(): void {
		this.loads.invalidate();
		this.invoice = "loading";
	}

	private async fetchTransaction(id: number): Promise<InvoiceDocument> {
		const tx = await TransactionApi.getById(id);
		const partner = await PartnerApi.getById(tx.partnerId);
		return invoiceFromTransaction(tx, partner);
	}

	private async fetchOrder(id: number): Promise<InvoiceDocument> {
		const order = await OrderApi.getById({ id });
		const partner = await PartnerApi.getById(order.customerId);
		return invoiceFromOrder(order, partner);
	}
}

export default InvoicePrintStore;
