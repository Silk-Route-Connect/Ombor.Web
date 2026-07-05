/**
 * P0 analytics event taxonomy — the single source for event names and their
 * property shapes. Mirrors docs/observability-analytics-plan.md §7; extend the
 * map (and the doc) together when adding P1/P2 events.
 *
 * Naming: snake_case, entity_action. Events with no custom properties map to
 * `undefined` so `analytics.capture` won't accept stray props for them.
 */
export interface AnalyticsEventProps {
	user_signed_up: undefined;
	user_logged_in: undefined;
	user_logged_out: undefined;
	password_reset_completed: undefined;

	sale_created: {
		line_count: number;
		subtotal: number;
		discount_total: number;
		total: number;
		from_template: boolean;
		has_attachments: boolean;
		/** Tender state at submit: none | partial | full | over. */
		payment_kind: string;
		/** Overpayment allocated to the partner's open transactions. */
		has_settlement: boolean;
		/** Disposition of the leftover on overpay (change | advance). */
		overpayment_disposition?: string;
	};
	supply_created: {
		line_count: number;
		subtotal: number;
		discount_total: number;
		total: number;
		from_template: boolean;
		has_attachments: boolean;
		payment_kind: string;
		has_settlement: boolean;
		overpayment_disposition?: string;
	};
	transaction_refunded: {
		direction: "Sale" | "Supply";
		line_count: number;
		total: number;
		original_id: number;
	};
	payment_recorded: {
		payment_type: string;
		direction: string;
		amount: number;
		has_settlement: boolean;
		wallet_type?: string;
	};

	order_created: {
		source: string;
		line_count: number;
		total: number;
		has_delivery_time: boolean;
	};
	order_status_changed: {
		from_status?: string;
		to_status: string;
	};

	// A stock adjustment is a single-product operation — no line_count.
	stock_adjustment_created: {
		direction: string;
		reason: string;
	};
	stock_transfer_created: {
		line_count: number;
	};
	wallet_transfer_created: {
		amount: number;
	};

	form_validation_failed: {
		form: string;
		field_count: number;
		first_field?: string;
	};
}

export type AnalyticsEvent = keyof AnalyticsEventProps;
