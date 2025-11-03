import axios from "axios";
import { attachHttpAuthInterceptors } from "services/auth/httpAuthInterceptor";

const baseURL = process.env.REACT_APP_OMBOR_API_BASE_URL;

if (!baseURL) {
	throw new Error("REACT_APP_OMBOR_API_BASE_URL must be defined");
}

const http = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

attachHttpAuthInterceptors(http);

export default http;
