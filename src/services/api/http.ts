import axios from "axios";

const baseURL = process.env.REACT_APP_OMBOR_API_BASE_URL;

if (!baseURL) {
	throw new Error("REACT_APP_OMBOR_API_BASE_URL must be defined");
}

const http = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

http.interceptors.response.use(
	(res) => res,
	(error: Error) => {
		console.error("API call failed:", error);
		return Promise.reject(error);
	},
);

export default http;
