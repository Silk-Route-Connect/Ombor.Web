import { tryRun } from "helpers/TryRun";
import { PaymentCurrency } from "models/payment";
import CurrencyApi from "services/api/CurrencyApi";

import { NotificationStore } from "./NotificationStore";

const LOCAL_CURRENCY: PaymentCurrency = "UZS";
const FOREIGN_CURRENCIES: PaymentCurrency[] = ["RUB", "USD"];

export interface ICurrencyStore {
	getExchangeRate(currency: PaymentCurrency): number;
	loadRates(): Promise<void>;
}

export class CurrencyStore implements ICurrencyStore {
	private readonly notificationStore: NotificationStore;
	private readonly exchangeRates: Map<PaymentCurrency, number> = new Map<PaymentCurrency, number>();
	private readonly loadingState: Map<PaymentCurrency, boolean> = new Map<
		PaymentCurrency,
		boolean
	>();

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		this.exchangeRates.set(LOCAL_CURRENCY, 1);
	}

	getExchangeRate(currency: PaymentCurrency): number {
		if (currency === LOCAL_CURRENCY) {
			return 1;
		}

		const cachedRate = this.exchangeRates.get(currency);
		if (cachedRate !== undefined) {
			return cachedRate;
		}

		// Fire-and-forget fetch so the value becomes available shortly.
		this.fetchExchangeRate(currency);
		return 1;
	}

	async loadRates(): Promise<void> {
		const promises = FOREIGN_CURRENCIES.map((el) => this.fetchExchangeRate(el));
		await Promise.all(promises);
	}

	async fetchExchangeRate(currency: PaymentCurrency): Promise<void> {
		if (this.loadingState.get(currency)) {
			return;
		}

		this.loadingState.set(currency, true);

		const result = await tryRun(() => CurrencyApi.getExchangeRate(currency));

		if (result.status === "fail") {
			this.notificationStore.error("currency.error.load");
		} else {
			this.exchangeRates.set(currency, result.data);
		}

		this.loadingState.set(currency, false);
	}
}
