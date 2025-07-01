export const convertToLocalCurrency = (amount: number, exchangeRate: number): number => {
	if (amount < 0 || exchangeRate < 0) {
		return 0;
	}

	return amount * exchangeRate;
};
