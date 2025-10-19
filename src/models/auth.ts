export interface LoginRequest {
	phoneNumber: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string; // returned, but we won’t store it client-side
}

export interface RegisterRequest {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	password: string;
	confirmPassword: string;
	organizationName: string;
	email?: string | null;
	telegramAccount?: string | null;
}

export interface RegisterResponse {
	message: string;
	expiresInMinutes: number; // OTP lifetime
}

export interface VerifyPhoneRequest {
	phoneNumber: string;
	code: string; // 4 digits
}

export type VerifyOtpResponse =
	| {
			success: true;
			accessToken: string;
			refreshToken: string;
			message?: string;
	  }
	| {
			success: false;
			accessToken?: null;
			refreshToken?: null;
			message?: string;
	  };

export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}
