import { NotificationAlert } from "../../models/notification";
import BaseApi from "./BaseApi";
import http from "./http";

/** The bell's alerts (`/api/notifications`) — read-only, computed on every read. */
class NotificationApi extends BaseApi {
	constructor() {
		super("notifications");
	}

	async getAll(): Promise<NotificationAlert[]> {
		const { data } = await http.get<NotificationAlert[]>(this.baseUrl);
		return data;
	}
}

const notificationApi = new NotificationApi();
export default notificationApi;
