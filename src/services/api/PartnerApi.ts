import {
	CreatePartnerRequest,
	Partner,
	PartnerLedgerEntry,
	UpdatePartnerRequest,
} from "../../models/partner";
import BaseApi from "./BaseApi";
import http from "./http";

/**
 * Partners API over the target v1 contract (`/api/partners`). The resource is
 * fully mocked (docs/mocking.md) — the live backend has no server-computed
 * balance, no opening-balance event, no archive/restore, and no ledger, all of
 * which this designed module needs (tech-change-list: not started). List ops are
 * client-side, so the collection endpoint takes no query params.
 */
class PartnerApi extends BaseApi {
	constructor() {
		super("partners");
	}

	async getAll(): Promise<Partner[]> {
		const response = await http.get<Partner[]>(this.getUrl());

		return response.data;
	}

	async getById(id: number): Promise<Partner> {
		const response = await http.get<Partner>(this.getUrlWithId(id));

		return response.data;
	}

	/** The dispute-grade running-balance ledger, newest first. */
	async getLedger(id: number): Promise<PartnerLedgerEntry[]> {
		const response = await http.get<PartnerLedgerEntry[]>(`${this.getUrlWithId(id)}/ledger`);

		return response.data;
	}

	async create(request: CreatePartnerRequest): Promise<Partner> {
		// The create response is a lean `CreatePartnerResponse` — it has no
		// server-computed `balance` / `isDeletable` / `activityCount`. Re-read the
		// full partner by id so the list shows the server-computed balance straight
		// away (rule 12) instead of «не число» until the next reload (F-011).
		const { data } = await http.post<{ id: number }>(this.getUrl(), request);

		return this.getById(data.id);
	}

	async update(request: UpdatePartnerRequest): Promise<Partner> {
		// The PUT response is the same lean shape as create — it has no
		// server-computed `balance` / `activityCount`. Re-read the full partner by
		// id so the detail page keeps its computed balance instead of «не число»
		// after an edit (F-011, same fix as create).
		await http.put(this.getUrlWithId(request.id), request);

		return this.getById(request.id);
	}

	/** Archive — the backend returns 204 No Content (no body). */
	async archive(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/archive`);
	}

	/** Restore — the backend returns 204 No Content (no body). */
	async restore(id: number): Promise<void> {
		await http.post(`${this.getUrlWithId(id)}/restore`);
	}

	/** Hard-delete — allowed by the mock only when the partner is unreferenced (409 otherwise). */
	async delete(id: number): Promise<void> {
		await http.delete(this.getUrlWithId(id));
	}
}

export default new PartnerApi();
