import {
	CreateTransferRequest,
	CreateWalletRequest,
	UpdateWalletRequest,
	Wallet,
	WalletOperation,
	WalletTransfer,
} from "../../models/wallet";
import http from "./http";

/**
 * Wallets API over the target v1 contract (`/api/wallets`). The resource is
 * fully mocked (docs/mocking.md) — the backend has no wallet/money-location
 * entity yet (tech-change-list: "Wallet entity — not started"). All derived
 * figures (balance, advances held, "our money", running balances) are served by
 * the mock per hard rule 8 / rule 12. JSON throughout, mirroring WarehouseApi.
 */
class WalletApi {
	private readonly baseUrl: string = "/api/wallets";

	/** Full collection — archived included; search/filter are client-side in v1. */
	async getAll(): Promise<Wallet[]> {
		const response = await http.get<Wallet[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<Wallet> {
		const response = await http.get<Wallet>(this.getUrlWithId(id));

		return response.data;
	}

	/** The «Операции» tab — every money movement through this wallet, newest first. */
	async getOperations(id: number): Promise<WalletOperation[]> {
		const response = await http.get<WalletOperation[]>(`${this.getUrlWithId(id)}/operations`);

		return response.data;
	}

	/** The «Переводы» tab — inter-wallet transfers touching this wallet, newest first. */
	async getTransfers(id: number): Promise<WalletTransfer[]> {
		const response = await http.get<WalletTransfer[]>(`${this.getUrlWithId(id)}/transfers`);

		return response.data;
	}

	async create(request: CreateWalletRequest): Promise<Wallet> {
		const response = await http.post<Wallet>(this.baseUrl, request);

		return response.data;
	}

	/** Name-only update — type and opening balance are immutable (rule 16). */
	async update(request: UpdateWalletRequest): Promise<Wallet> {
		const response = await http.put<Wallet>(this.getUrlWithId(request.id), request);

		return response.data;
	}

	async archive(id: number): Promise<Wallet> {
		const response = await http.post<Wallet>(`${this.getUrlWithId(id)}/archive`);

		return response.data;
	}

	async restore(id: number): Promise<Wallet> {
		const response = await http.post<Wallet>(`${this.getUrlWithId(id)}/restore`);

		return response.data;
	}

	/** Record an inter-wallet transfer — an audited, immutable event (rule 16). */
	async createTransfer(request: CreateTransferRequest): Promise<WalletTransfer> {
		const response = await http.post<WalletTransfer>(`${this.baseUrl}/transfers`, request);

		return response.data;
	}

	private getUrlWithId(id: number): string {
		return `${this.baseUrl}/${id}`;
	}
}

const walletApi = new WalletApi();
export default walletApi;
