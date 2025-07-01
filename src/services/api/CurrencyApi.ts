import { PaymentCurrency } from "models/payment";

import BaseApi from "./BaseApi";

const Exchange_Rates: Record<PaymentCurrency, number> = {
	RUB: 159.92,
	USD: 12556.96,
	UZS: 1,
};

class CurrencyApi extends BaseApi {
	constructor() {
		super("currencies");
	}

	async getExchangeRate(currency: PaymentCurrency): Promise<number> {
		await Promise.resolve(() =>
			setTimeout(() => {
				console.log(`fetching currency: ${currency}`);
			}, 1000),
		);

		return Exchange_Rates[currency];
	}
}

export default new CurrencyApi();
