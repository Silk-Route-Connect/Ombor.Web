import {
	CreateWalletRequest,
	Wallet,
	WalletOperation,
	WalletOperationKind,
	WalletTransfer,
	WalletType,
} from "../../models/wallet";

/**
 * In-memory seed + mutation for the Wallets («Касса») mock. The backend has no
 * wallet entity yet (tech-change-list: "Wallet entity — not started"), so the
 * whole resource is mocked here at the target v1 contract (docs/mocking.md).
 * Mutations persist within a session and reset on reload.
 *
 * Self-contained (like the Partners ledger): the operations ledger and transfers
 * are seeded here and do NOT cross-reference the (legacy) Payments mock — the
 * payment numbers («P-520») are illustrative and a payment-row click only toasts.
 * Every derived figure is SERVED here as the authoritative computed value (hard
 * rule 8 / rule 12): each wallet stores its balance / advances held / opening,
 * and "our money" is balance − advances. Operations carry a served `balanceAfter`
 * running balance; these running balances are illustrative and not recomputed
 * from the opening balance (a known mock limitation — like the warehouse ledger).
 * Creating a transfer adjusts both wallets' served balances and prepends an
 * operation to each side, so the screens stay consistent within a session.
 */

const AUTHOR = "Бахром Саидов";

type WalletSeed = {
	id: number;
	name: string;
	type: WalletType;
	/** Served balance (rule 15). */
	balance: number;
	/** Served advances held for partners (rule 11). */
	advancesHeld: number;
	openingBalance: number;
	isArchived: boolean;
	createdAt: string;
};

const walletSeed: WalletSeed[] = [
	{
		id: 1,
		name: "Основная касса",
		type: "Cash",
		balance: 4_200_000,
		advancesHeld: 700_000,
		openingBalance: 5_000_000,
		isArchived: false,
		createdAt: "2024-01-12",
	},
	{
		id: 2,
		name: "Терминал",
		type: "Card",
		balance: 1_850_000,
		advancesHeld: 0,
		openingBalance: 0,
		isArchived: false,
		createdAt: "2024-01-12",
	},
	{
		id: 3,
		name: "Расчётный счёт",
		type: "Bank",
		balance: 12_400_000,
		advancesHeld: 500_000,
		openingBalance: 8_000_000,
		isArchived: false,
		createdAt: "2024-01-12",
	},
	{
		id: 4,
		name: "Старая касса",
		type: "Cash",
		balance: 45_000,
		advancesHeld: 0,
		openingBalance: 200_000,
		isArchived: true,
		createdAt: "2023-05-03",
	},
];

let wallets: WalletSeed[] = walletSeed.map((w) => ({ ...w }));
let nextWalletId = Math.max(...wallets.map((w) => w.id)) + 1;

/** Operations keyed by wallet id (newest first), mirroring the prototype seed. */
type OperationSeed = Omit<WalletOperation, "id"> & { id: number };

const operations = new Map<number, OperationSeed[]>([
	[
		1,
		[
			op(101, "2026-06-08", "Payment", "In", "P-520", "Виктория", 1_200_000, 4_200_000),
			op(102, "2026-06-06", "Deposit", "In", "P-518", "Геннадий Зайцев", 500_000, 6_000_000),
			op(103, "2026-06-05", "Expense", "Out", "P-517", "Аренда офиса", 2_800_000, 3_000_000),
			op(104, "2026-06-03", "Withdrawal", "Out", "P-515", "Артём Орехников", 200_000, 5_800_000),
			op(105, "2026-06-01", "Transfer", "Out", null, "→ Расчётный счёт", 1_500_000, 5_500_000, 1),
		],
	],
	[
		2,
		[
			op(201, "2026-06-07", "Payment", "In", "P-519", "Антонина Давыдова", 640_000, 1_850_000),
			op(202, "2026-06-02", "Payment", "In", "P-514", "Виктория", 410_000, 1_210_000),
		],
	],
	[
		3,
		[
			op(301, "2026-06-04", "Payment", "Out", "P-516", "Валерия Соколова", 3_200_000, 12_400_000),
			op(302, "2026-06-01", "Transfer", "In", null, "← Основная касса", 1_500_000, 15_600_000, 1),
		],
	],
	[4, []],
]);

function op(
	id: number,
	date: string,
	kind: WalletOperationKind,
	direction: WalletOperation["direction"],
	paymentNumber: string | null,
	party: string,
	amount: number,
	balanceAfter: number,
	transferId: number | null = null,
	partnerId: number | null = null,
): OperationSeed {
	return {
		id,
		date,
		kind,
		direction,
		paymentNumber,
		party,
		amount,
		balanceAfter,
		transferId,
		partnerId,
	};
}

let transfers: WalletTransfer[] = [
	{
		id: 1,
		date: "2026-06-01",
		fromWalletId: 1,
		fromWalletName: "Основная касса",
		fromWalletType: "Cash",
		toWalletId: 3,
		toWalletName: "Расчётный счёт",
		toWalletType: "Bank",
		amount: 1_500_000,
		createdBy: AUTHOR,
		note: "Инкассация за май",
	},
	{
		id: 2,
		date: "2026-05-25",
		fromWalletId: 3,
		fromWalletName: "Расчётный счёт",
		fromWalletType: "Bank",
		toWalletId: 1,
		toWalletName: "Основная касса",
		toWalletType: "Cash",
		amount: 3_000_000,
		createdBy: AUTHOR,
		note: "Подкрепление кассы",
	},
];

let nextTransferId = Math.max(...transfers.map((t) => t.id)) + 1;
let nextOperationId = 10_000;

/* ───────────────────────────── projection ─────────────────────────────── */

function toWallet(row: WalletSeed): Wallet {
	return {
		id: row.id,
		name: row.name,
		type: row.type,
		balance: row.balance,
		advancesHeld: row.advancesHeld,
		// Served per rule 12 — the business's own money in the wallet.
		ourMoney: row.balance - row.advancesHeld,
		openingBalance: row.openingBalance,
		isArchived: row.isArchived,
		createdBy: AUTHOR,
		createdAt: row.createdAt,
	};
}

/* ───────────────────────────── queries ────────────────────────────────── */

export function listWallets(): Wallet[] {
	return wallets.map(toWallet);
}

export function findWallet(id: number): Wallet | undefined {
	const row = wallets.find((w) => w.id === id);
	return row ? toWallet(row) : undefined;
}

export function walletNameExists(name: string, exceptId?: number): boolean {
	const normalized = name.trim().toLowerCase();
	return wallets.some((w) => w.id !== exceptId && w.name.trim().toLowerCase() === normalized);
}

export function listWalletOperations(walletId: number): WalletOperation[] {
	return [...(operations.get(walletId) ?? [])].sort(
		(a, b) => Date.parse(b.date) - Date.parse(a.date),
	);
}

/** Inter-wallet transfers touching this wallet (either side), newest first. */
export function listWalletTransfers(walletId: number): WalletTransfer[] {
	return transfers
		.filter((t) => t.fromWalletId === walletId || t.toWalletId === walletId)
		.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/* ───────────────────────────── mutations ──────────────────────────────── */

export function addWallet(write: CreateWalletRequest): Wallet {
	const row: WalletSeed = {
		id: nextWalletId++,
		name: write.name,
		type: write.type,
		// A new wallet starts at its opening balance with no advances held.
		balance: write.openingBalance,
		advancesHeld: 0,
		openingBalance: write.openingBalance,
		isArchived: false,
		createdAt: new Date().toISOString(),
	};
	wallets = [...wallets, row];
	operations.set(row.id, []);
	return toWallet(row);
}

/** Name-only edit (type and opening balance are immutable — rule 16). */
export function editWallet(id: number, name: string): Wallet | undefined {
	const row = wallets.find((w) => w.id === id);
	if (!row) {
		return undefined;
	}
	row.name = name;
	return toWallet(row);
}

export function setWalletArchived(id: number, archived: boolean): Wallet | undefined {
	const row = wallets.find((w) => w.id === id);
	if (!row) {
		return undefined;
	}
	row.isArchived = archived;
	return toWallet(row);
}

/**
 * Record an inter-wallet transfer (rule 16): move cash from one wallet to
 * another, adjust both served balances, and prepend an audited operation to each
 * side's ledger. Returns the created transfer (the page reloads affected data).
 */
export function addTransfer(
	fromWalletId: number,
	toWalletId: number,
	amount: number,
	note: string | null,
): WalletTransfer {
	const from = wallets.find((w) => w.id === fromWalletId)!;
	const to = wallets.find((w) => w.id === toWalletId)!;

	from.balance -= amount;
	to.balance += amount;

	const transfer: WalletTransfer = {
		id: nextTransferId++,
		date: new Date().toISOString(),
		fromWalletId: from.id,
		fromWalletName: from.name,
		fromWalletType: from.type,
		toWalletId: to.id,
		toWalletName: to.name,
		toWalletType: to.type,
		amount,
		createdBy: AUTHOR,
		note,
	};
	transfers = [transfer, ...transfers];

	const fromOps = operations.get(from.id) ?? [];
	fromOps.unshift(
		op(
			++nextOperationId,
			transfer.date,
			"Transfer",
			"Out",
			null,
			`→ ${to.name}`,
			amount,
			from.balance,
			transfer.id,
		),
	);
	operations.set(from.id, fromOps);

	const toOps = operations.get(to.id) ?? [];
	toOps.unshift(
		op(
			++nextOperationId,
			transfer.date,
			"Transfer",
			"In",
			null,
			`← ${from.name}`,
			amount,
			to.balance,
			transfer.id,
		),
	);
	operations.set(to.id, toOps);

	return transfer;
}

export function findTransfer(id: number): WalletTransfer | undefined {
	return transfers.find((t) => t.id === id);
}
