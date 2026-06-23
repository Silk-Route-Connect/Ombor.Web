import { delay, http, HttpResponse } from "msw";

import {
	ForgotPasswordRequest,
	ResetPasswordRequest,
	VerifyResetCodeRequest,
} from "../../models/auth";

/**
 * Password-reset is mocked at the target v1 contract — the backend exposes only
 * login/register/verification/refresh/logout, with NO reset endpoint
 * (docs/mocking.md). Login / register / verify are the REAL backend and are NOT
 * mocked here; only these three reset routes are intercepted, everything else on
 * `/api/auth/*` passes through.
 *
 * Demo: the accepted reset code is `1234` (4 digits, matching the real OTP
 * length). Any well-formed phone is accepted at the request step.
 */
const RESET_CODE = "1234";
const CODE_TTL_MINUTES = 5;

const FORGOT_URL = "*/api/auth/forgot-password";
const VERIFY_URL = "*/api/auth/verify-reset-code";
const RESET_URL = "*/api/auth/reset-password";

function validationProblem(errors: Record<string, string[]>, status = 400) {
	return HttpResponse.json(
		{ status, title: "One or more validation errors occurred.", errors },
		{ status },
	);
}

export const authHandlers = [
	// CONTRACT: POST /api/auth/forgot-password { phoneNumber }
	//   → 200 { message, expiresInMinutes }. 400 when the phone is missing.
	http.post(FORGOT_URL, async ({ request }) => {
		await delay(400);
		const body = (await request.json().catch(() => ({}))) as Partial<ForgotPasswordRequest>;
		if (!body.phoneNumber || String(body.phoneNumber).trim() === "") {
			return validationProblem({ phoneNumber: ["Введите номер телефона"] });
		}
		return HttpResponse.json({
			message: "Код для сброса пароля отправлен",
			expiresInMinutes: CODE_TTL_MINUTES,
		});
	}),

	// CONTRACT: POST /api/auth/verify-reset-code { phoneNumber, code }
	//   → 200 { success } (success:false on a wrong code, mirroring verifyOtp).
	http.post(VERIFY_URL, async ({ request }) => {
		await delay(400);
		const body = (await request.json().catch(() => ({}))) as Partial<VerifyResetCodeRequest>;
		const code = (body.code ?? "").trim();
		if (code === RESET_CODE) {
			return HttpResponse.json({ success: true });
		}
		return HttpResponse.json({ success: false, message: "Неверный код. Попробуйте снова." });
	}),

	// CONTRACT: POST /api/auth/reset-password { phoneNumber, code, newPassword, confirmPassword }
	//   → 200 { success }. 400 on a weak / mismatched password; success:false on a bad code.
	http.post(RESET_URL, async ({ request }) => {
		await delay(450);
		const body = (await request.json().catch(() => ({}))) as Partial<ResetPasswordRequest>;
		const errors: Record<string, string[]> = {};
		if (!body.newPassword || body.newPassword.length < 8) {
			errors.newPassword = ["Минимальная длина пароля — 8 символов"];
		}
		if (body.confirmPassword !== body.newPassword) {
			errors.confirmPassword = ["Пароли не совпадают"];
		}
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}
		if ((body.code ?? "").trim() !== RESET_CODE) {
			return HttpResponse.json({ success: false, message: "Неверный код подтверждения" });
		}
		return HttpResponse.json({ success: true, message: "Пароль изменён" });
	}),
];
