import { ActivityItem, ActivityPage, GetActivityRequest } from "../../models/activity";
import BaseApi from "./BaseApi";
import http from "./http";

/** Activity Log API (`/api/activity`) — read-only, newest operation first. */
class ActivityApi extends BaseApi {
	constructor() {
		super("activity");
	}

	async getPage(request: GetActivityRequest): Promise<ActivityPage> {
		const { data } = await http.get<ActivityPage>(this.getUrl(request));
		return data;
	}

	/** One operation with every change (the list item carries at most 50). */
	async getOperation(operationId: string): Promise<ActivityItem> {
		const { data } = await http.get<ActivityItem>(
			`${this.baseUrl}/${encodeURIComponent(operationId)}`,
		);
		return data;
	}
}

const activityApi = new ActivityApi();
export default activityApi;
