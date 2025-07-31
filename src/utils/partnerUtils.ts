export const getBalanceColor = (balance: number): string => {
	if (balance < 0) {
		return "error.main";
	} else if (balance > 0) {
		return "success.main";
	}

	return "text.primary";
};
