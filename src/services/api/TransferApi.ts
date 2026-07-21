import { CreateTransferRequest, Transfer } from "../../models/transfer";
import http from "./http";

/**
 * Transfers API over the target v1 contract (`/api/transfers`). The resource is
 * mocked (docs/mocking.md) — the backend DTO lacks the author and per-line unit
 * the redesign shows. Transfers are immutable (rule 16): only list + create.
 */
class TransferApi {
	private readonly baseUrl: string = "/api/transfers";

	/** Full collection — no query params; warehouse filter is client-side. */
	async getAll(): Promise<Transfer[]> {
		const response = await http.get<Transfer[]>(this.baseUrl);

		return response.data;
	}

	async create(request: CreateTransferRequest): Promise<Transfer> {
		const response = await http.post<Transfer>(this.baseUrl, request);

		return response.data;
	}
}

const transferApi = new TransferApi();
export default transferApi;
