import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

import { AnalyticsEvent, AnalyticsEventProps } from "./events";
import { isPostHogInitialized } from "./posthog";

/**
 * Minimal user shape for identification — mirrors the claims available in the
 * access token (AuthStore.userFromAccessToken). Kept local so telemetry never
 * imports from stores (avoids import cycles).
 */
export interface TelemetryUser {
	id?: number;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	organizationName?: string;
}

type CaptureArgs<E extends AnalyticsEvent> = AnalyticsEventProps[E] extends undefined
	? []
	: [AnalyticsEventProps[E]];

/**
 * The one telemetry surface domain code talks to. Every method is a safe
 * no-op when telemetry is uninitialized (dev, previews, missing keys), so
 * callers never need to guard.
 */
export const analytics = {
	/** Send a typed product-analytics event (taxonomy in ./events.ts). */
	capture<E extends AnalyticsEvent>(event: E, ...args: CaptureArgs<E>): void {
		if (!isPostHogInitialized()) {
			return;
		}
		posthog.capture(event, args[0]);
	},

	/**
	 * Tie the session to the logged-in user in BOTH tools: PostHog person
	 * (merging any anonymous pre-login activity) and Sentry user context (so
	 * errors/replays are attributable). Person props are beta max-capture
	 * (plan decision #2) — trimmed before GA.
	 */
	identify(user: TelemetryUser): void {
		if (user.id == null) {
			return;
		}

		const id = String(user.id);
		const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined;

		if (isPostHogInitialized()) {
			posthog.identify(id, {
				name,
				phone: user.phoneNumber,
				organization: user.organizationName,
			});
		}

		// Sentry.setUser is a safe no-op when Sentry isn't initialized.
		Sentry.setUser({ id, username: name });
	},

	/** Clear identity on logout — the next session starts anonymous. */
	reset(): void {
		if (isPostHogInitialized()) {
			posthog.reset();
		}
		Sentry.setUser(null);
	},
};
