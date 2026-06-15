/**
 * Wallet (the «Касса» money-location resource) — answers "how much cash do I
 * have, and where?". A wallet is a Cash register, Card terminal or Bank account
 * (business-rules §C). The backend has no wallet entity yet (tech-change-list:
 * "Wallet entity — not started"), so the whole resource is mocked at the target
 * v1 contract under `/api/wallets` (docs/mocking.md).
 *
 * Every derived figure — balance, advances held, "our money" — is server-computed
 * and served (hard rule 8 / rule 12); clients never recompute a balance from
 * event lists. Balance is opening balance + Wallet-type payment components +
 * inter-wallet transfers (rule 15). "Our money" = balance − advances held for
 * partners (rule 12): the wallet physically holds the advance cash, but partners
 * have a claim on it. Wallets archive-only, never deleted (rule 29); an archived
 * wallet that still holds money still counts in totals (rule 31).
 */
export const WALLET_TYPES = ["Cash", "Card", "Bank"] as const;
export type WalletType = (typeof WALLET_TYPES)[number];

export type Wallet = {
	id: number;
	name: string;
	type: WalletType;

	/**
	 * Server-computed figures (hard rule 8 / rule 12) — never recomputed
	 * client-side. An archived wallet still holding money still reports them.
	 */
	/** Computed balance: opening + Wallet-type components + transfers (rule 15). */
	balance: number;
	/** Advances held for partners that physically sit in this wallet (rule 11). */
	advancesHeld: number;
	/** balance − advancesHeld — the business's own money in the wallet (rule 12). */
	ourMoney: number;

	/** Opening-balance event amount — auditable, immutable after creation (rule 16). */
	openingBalance: number;

	isArchived: boolean;
	/** Display author of the create event. */
	createdBy: string;
	/** ISO date string of creation. */
	createdAt: string;
};

/**
 * Kinds of money movement through a wallet, shown as the «Тип» chip in the
 * operations ledger. Beyond the partner payment kinds, a Transfer row records an
 * inter-wallet move (its `transferId` links to the WalletTransfer detail).
 */
export const WALLET_OPERATION_KINDS = [
	"Payment",
	"Deposit",
	"Expense",
	"Withdrawal",
	"Transfer",
] as const;
export type WalletOperationKind = (typeof WALLET_OPERATION_KINDS)[number];

export type WalletOperationDirection = "In" | "Out";

/** One money movement through a wallet — the «Операции» tab row (newest first). */
export type WalletOperation = {
	id: number;
	/** ISO date string. */
	date: string;
	kind: WalletOperationKind;
	direction: WalletOperationDirection;
	/** Payment number («P-520») for partner payments; null for transfers. */
	paymentNumber: string | null;
	/** Partner / recipient name, or the transfer direction («→ Расчётный счёт»). */
	party: string;
	amount: number;
	/** Served running balance of the wallet after this event (hard rule 8). */
	balanceAfter: number;
	/** Set when this row is an inter-wallet transfer — opens the transfer detail. */
	transferId: number | null;
};

/** An inter-wallet transfer — auditable, immutable once created (rule 16). */
export type WalletTransfer = {
	id: number;
	/** ISO date string. */
	date: string;
	fromWalletId: number;
	fromWalletName: string;
	fromWalletType: WalletType;
	toWalletId: number;
	toWalletName: string;
	toWalletType: WalletType;
	amount: number;
	createdBy: string;
	note: string | null;
};

export type CreateWalletRequest = {
	name: string;
	type: WalletType;
	openingBalance: number;
};

/** Only the name is editable; type and opening balance are immutable (rule 16). */
export type UpdateWalletRequest = {
	id: number;
	name: string;
};

export type CreateTransferRequest = {
	fromWalletId: number;
	toWalletId: number;
	amount: number;
	note: string | null;
};
