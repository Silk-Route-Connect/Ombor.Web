type Reporter = () => void;

let reportDown: Reporter = () => {};
let reportUp: Reporter = () => {};

/**
 * Decouples the axios error interceptor (a plain module) from the MobX
 * `ConnectivityStore`, mirroring `AuthTokenBridge`. The store registers its
 * reporters on construction; the interceptor calls them on every response so the
 * UI can react to the backend going down / recovering (F-028).
 */
export const ConnectivityBridge = {
	register(down: Reporter, up: Reporter): void {
		reportDown = down;
		reportUp = up;
	},

	reportDown(): void {
		reportDown();
	},

	reportUp(): void {
		reportUp();
	},
};
