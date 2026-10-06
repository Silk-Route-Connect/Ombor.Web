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
 * Wallets API (`/api/wallets`). All derived figures (balance, advances held,
 * "our money", running balances) are served by the backend per hard rule 8 /
 * rule 12. JSON throughout, mirroring WarehouseApi.
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

	/** Archive — soft-delete (rule 29). The backend returns 204 No Content. */
	async archive(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/archive`);
	}

	/** Restore an archived wallet. The backend returns 204 No Content. */
	async restore(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/restore`);
	}

	/** Hard-delete — allowed only while the wallet is unreferenced (409 `entity.referenced` otherwise). */
	async delete(id: number): Promise<void> {
		await http.delete(this.getUrlWithId(id));
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
