import { SearchRequest, SearchResults } from "../../models/search";
import BaseApi from "./BaseApi";
import http from "./http";

/** Global search API (`/api/search`) — read-only. */
class SearchApi extends BaseApi {
	constructor() {
		super("search");
	}

	/** `signal` cancels a superseded query while the user keeps typing. */
	async search(request: SearchRequest, signal?: AbortSignal): Promise<SearchResults> {
		const { data } = await http.get<SearchResults>(this.getUrl(request), { signal });
		return data;
	}
}

const searchApi = new SearchApi();
export default searchApi;
