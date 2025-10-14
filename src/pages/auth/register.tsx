// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Snackbar, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import "../../styles/auth.scss";
import { Link, useNavigate } from "react-router-dom";

const formSchema = z
	.object({
		firstName: z.string().min(2, { message: "Ism kiriting" }),
		lastName: z.string().min(2, { message: "Familiya kiriting" }),
		phoneNumber: z.string().regex(/^\+998 \d{2} \d{3} \d{4}$/, {
			message: "Telefon raqamni to'g'ri kiriting",
		}),
		password: z.string().min(5, { message: "Parol eng kami 5 ta bo'lishi kerak" }),
		confirmPassword: z.string().min(5, { message: "Parolni tasdiqlang" }),
		organizationName: z.string().min(2, { message: "Tashkilot nomini kiriting" }),
		email: z.string().email({ message: "Email xato" }),
		telegramAccount: z.string().min(2, { message: "Telegram manzilini kiriting" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Parollar mos emas",
		path: ["confirmPassword"],
	});

type FormValues = z.infer<typeof formSchema>;

const RegisterPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [phoneValue, setPhoneValue] = useState("+998 ");
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
		open: false,
		message: "",
	});
	const [otpMode, setOtpMode] = useState(true);
	const [otpCode, setOtpCode] = useState("");
	const [timer, setTimer] = useState<number>(0);
	const [savedFormData, setSavedFormData] = useState<FormValues | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phoneNumber: "+998 ",
			password: "",
			confirmPassword: "",
			organizationName: "",
			email: "",
			telegramAccount: "",
		},
	});

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value.replace(/\D/g, "");
		if (!value.startsWith("998")) value = "998" + value;
		value = value.slice(0, 12);

		const formatted =
			"+998 " +
			(value.slice(3, 5) ? value.slice(3, 5) + " " : "") +
			(value.slice(5, 8) ? value.slice(5, 8) + " " : "") +
			(value.slice(8, 12) ? value.slice(8, 12) : "");

		setPhoneValue(formatted.trimEnd());
		form.setValue("phoneNumber", formatted.trimEnd());
	};

	const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

	const onSubmit = async (values: FormValues) => {
		setLoading(true);
		try {
			const submittingData = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber.replace(/\s+/g, ""),
				password: values.password,
				confirmPassword: values.confirmPassword,
				organizationName: values.organizationName,
				email: values.email,
				telegramAccount: values.telegramAccount,
			};

			const res = await axios.post(
				"https://miraziz-002-site1.ktempurl.com/api/auth/register",
				submittingData,
			);

			setSavedFormData(values);
			setOtpCode("");
			const expiresInMinutes = parseInt(res.data.expiresInMinutes) || 0;
			setTimer(expiresInMinutes * 60);
			setOtpMode(true);
			setSnackbar({ open: true, message: res.data.message });
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error?.response?.data?.title || "Xatolik yuz berdi",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleOtpSubmit = async () => {
		if (otpCode.length !== 4) {
			setSnackbar({ open: true, message: "4 xonali kod kiriting" });
			return;
		}
		setLoading(true);
		try {
			await axios.post("https://miraziz-002-site1.ktempurl.com/api/auth/verification", {
				phoneNumber: savedFormData?.phoneNumber?.replace(/\s+/g, ""),
				code: otpCode,
			});
			setSnackbar({ open: true, message: "Tasdiq muvaffaqiyatli yakunlandi!" });
			setOtpMode(false);
			navigate("/");
			form.reset();
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error?.response?.data?.title || "Kod xato kiritildi",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResend = () => {
		if (savedFormData) onSubmit(savedFormData);
	};

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((t) => (t > 0 ? t - 1 : 0));
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const minutes = Math.floor(timer / 60);
	const seconds = timer % 60;
	const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;

	return (
		<div className="register-page">
			<div className="register-container">
				{!otpMode ? (
					<>
						<h2 className="login-title">Ro'yxatdan o'tish</h2>
						<form onSubmit={form.handleSubmit(onSubmit)} className="register-form">
							<div className="row">
								<div className="form-group">
									<label>Ism</label>
									<Input disableUnderline {...form.register("firstName")} className="input-field" />
									{form.formState.errors.firstName && (
										<p className="error-text">{form.formState.errors.firstName.message}</p>
									)}
								</div>
								<div className="form-group">
									<label>Familiya</label>
									<Input disableUnderline {...form.register("lastName")} className="input-field" />
									{form.formState.errors.lastName && (
										<p className="error-text">{form.formState.errors.lastName.message}</p>
									)}
								</div>
							</div>

							<div className="form-group">
								<label>Telefon raqam</label>
								<Input
									type="tel"
									disableUnderline
									value={phoneValue}
									onChange={handlePhoneChange}
									fullWidth
									className="input-field"
								/>
								{form.formState.errors.phoneNumber && (
									<p className="error-text">{form.formState.errors.phoneNumber.message}</p>
								)}
							</div>

							<div className="row">
								<div className="form-group password-group">
									<label>Parol</label>
									<div className="password-wrapper">
										<Input
											type={showPassword ? "text" : "password"}
											disableUnderline
											{...form.register("password")}
											fullWidth
											className="input-field"
										/>
										<span
											className="password-toggle"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</span>
									</div>
									{form.formState.errors.password && (
										<p className="error-text">{form.formState.errors.password.message}</p>
									)}
								</div>
								<div className="form-group password-group">
									<label>Parolni tasdiqlash</label>
									<div className="password-wrapper">
										<Input
											type={showConfirmPassword ? "text" : "password"}
											disableUnderline
											{...form.register("confirmPassword")}
											fullWidth
											className="input-field"
										/>
										<span
											className="password-toggle"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</span>
									</div>
									{form.formState.errors.confirmPassword && (
										<p className="error-text">{form.formState.errors.confirmPassword.message}</p>
									)}
								</div>
							</div>

							<div className="row">
								<div className="form-group">
									<label>Telegram</label>
									<Input
										disableUnderline
										{...form.register("telegramAccount")}
										className="input-field"
									/>
									{form.formState.errors.telegramAccount && (
										<p className="error-text">{form.formState.errors.telegramAccount.message}</p>
									)}
								</div>
								<div className="form-group">
									<label>Email</label>
									<Input disableUnderline {...form.register("email")} className="input-field" />
									{form.formState.errors.email && (
										<p className="error-text">{form.formState.errors.email.message}</p>
									)}
								</div>
							</div>

							<div className="form-group">
								<label>Tashkilot</label>
								<Input
									disableUnderline
									{...form.register("organizationName")}
									className="input-field"
								/>
								{form.formState.errors.organizationName && (
									<p className="error-text">{form.formState.errors.organizationName.message}</p>
								)}
							</div>

							<Button
								type="submit"
								variant="contained"
								className="submit-button"
								disabled={loading}
							>
								{loading ? <CircularProgress size={24} color="inherit" /> : "Ro'yxatdan o'tish"}
							</Button>
						</form>
						<Link className="register-link" to={"/auth/login"}>
							Loginga o'tish
						</Link>
					</>
				) : (
					<div className="otp-container">
						<h3 className="login-title">Kodni kiriting</h3>
						<p className="otp-text">
							{savedFormData?.phoneNumber} raqamiga yuborilgan 4 xonali kodni kiriting
						</p>
						<Input
							value={otpCode}
							onChange={(e) => setOtpCode(e.target.value)}
							className="input-field"
							inputProps={{ maxLength: 4 }}
							disableUnderline
						/>
						<Button
							variant="contained"
							className="submit-button"
							onClick={handleOtpSubmit}
							disabled={loading || !otpCode}
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : "Tasdiqlash"}
						</Button>

						{timer > 0 ? (
							<p className="timer-text">Qolgan vaqt: {formattedTime}</p>
						) : (
							<Button variant="text" onClick={handleResend} className="resend-button">
								Kodni qayta olish
							</Button>
						)}
					</div>
				)}
			</div>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				message={snackbar.message}
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
						<CloseIcon fontSize="small" />
					</IconButton>
				}
			/>
		</div>
	);
};

export default RegisterPage;
