import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Snackbar, IconButton } from "@mui/material";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import "../../styles/auth.scss";

const formSchema = z.object({
	phone: z.string().regex(/^\+998 \d{2} \d{3} \d{4}$/, {
		message: "Telefon raqamni to'g'ri kiriting.",
	}),
	password: z.string().min(5, { message: "Parol eng kami 5 ta bo'lishi kerak." }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [phoneValue, setPhoneValue] = useState("+998 ");
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
		open: false,
		message: "",
	});
	const navigate = useNavigate();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { phone: "+998 ", password: "" },
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
		form.setValue("phone", formatted.trimEnd());
	};

	const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.currentTarget.selectionStart! <= 5 && e.key === "Backspace") {
			e.preventDefault();
		}
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const onSubmit = async (values: FormValues) => {
		const submittingData = {
			phoneNumber: values.phone.replace(/\s+/g, ""),
			password: values.password,
		};

		try {
			const res = await axios.post(
				"https://miraziz-002-site1.ktempurl.com/api/auth/login",
				submittingData,
			);
			Cookies.set("accessToken", res.data.accessToken, { expires: 7 });
			Cookies.set("refreshToken", res.data.refreshToken, { expires: 7 });
			setSnackbar({ open: true, message: "Tizimga muvaffaqiyatli kirildi." });
			setTimeout(() => navigate("/"), 1000);
		} catch (error: any) {
			setSnackbar({
				open: true,
				message: error?.response?.data?.title || "Tizimga kirishda xatolik yuz berdi",
			});
		}
	};

	return (
		<div className="login-page">
			<div className="login-container">
				<h2 className="login-title">Tizimga kirish</h2>
				<p className="login-subtitle">Telefon raqamingiz va parolni kiriting</p>

				<form onSubmit={form.handleSubmit(onSubmit)} className="login-form">
					<div className="form-group">
						<label>Telefon raqam</label>
						<Input
							type="tel"
							value={phoneValue}
							onChange={handlePhoneChange}
							onKeyDown={handlePhoneKeyDown}
							fullWidth
						/>
						{form.formState.errors.phone && (
							<p className="error-text">{form.formState.errors.phone.message}</p>
						)}
					</div>

					<div className="form-group password-group">
						<label>Parol</label>
						<div className="password-wrapper">
							<Input
								placeholder="******"
								type={showPassword ? "text" : "password"}
								{...form.register("password")}
								fullWidth
								className="input-field"
							/>
							<span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
							</span>
						</div>
						{form.formState.errors.password && (
							<p className="error-text">{form.formState.errors.password.message}</p>
						)}
					</div>

					<Button
						type="submit"
						variant="contained"
						color="primary"
						className="submit-button"
						startIcon={<LoginIcon />}
					>
						Kirish
					</Button>
				</form>
				<Link className="register-link" to={"/auth/register"}>
					Ro'yxatdan o'tish
				</Link>
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

export default LoginPage;
