import { CreateTransferRequest, Transfer } from "../../models/transfer";
import http from "./http";

/**
 * Transfers API (`/api/transfers`). Transfers are immutable (rule 16): only
 * list, get one and create.
 */
class TransferApi {
	private readonly baseUrl: string = "/api/transfers";

	/** Full collection — no query params; warehouse filter is client-side. */
	async getAll(): Promise<Transfer[]> {
		const response = await http.get<Transfer[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<Transfer> {
		const response = await http.get<Transfer>(`${this.baseUrl}/${id}`);

		return response.data;
	}

	async create(request: CreateTransferRequest): Promise<Transfer> {
		const response = await http.post<Transfer>(this.baseUrl, request);

		return response.data;
	}
}

const transferApi = new TransferApi();
export default transferApi;
