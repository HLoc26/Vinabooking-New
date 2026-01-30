import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, TextField, Typography, Link, Divider } from "@mui/material";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { useLogin } from "../hooks/useLogin"; // Using your TanStack hook

type LoginFormProps = {
	onSuccess?: () => void;
};

// Define the shape of your form for TypeScript
interface ILoginFormInputs {
	email: "";
	password: "";
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
	const { pushNotification } = usePushNotificationContext();
	const { mutate: login, isPending } = useLogin();

	const { control, handleSubmit } = useForm<ILoginFormInputs>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: ILoginFormInputs) => {
		// Validation is handled by RHF/TanStack, but you can add Zod later
		login(data, {
			onSuccess: () => {
				pushNotification("Login success", "success");
				onSuccess?.();
			},
			onError: (err: unknown) => {
				const e = err as Error;
				pushNotification(e.message || "Login failed", "error");
			},
		});
	};

	return (
		<Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<Controller
				name="email"
				control={control}
				rules={{ required: "You can't have an empty email, can you?" }}
				render={({ field, fieldState: { error } }) => <TextField {...field} fullWidth margin="normal" label="Email" type="email" error={!!error} helperText={error?.message} />}
			/>

			<Controller
				name="password"
				control={control}
				rules={{ required: "You need to enter your password" }}
				render={({ field, fieldState: { error } }) => <TextField {...field} fullWidth margin="normal" label="Password" type="password" error={!!error} helperText={error?.message} />}
			/>

			<Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2, py: 1.2 }} disabled={isPending}>
				{isPending ? "Processing..." : "Log in"}
			</Button>

			<Typography textAlign="center" variant="body2" mt={1}>
				<Link href="/auth/forgot-password" color="primary">
					Forgot your password?
				</Link>
			</Typography>

			<Typography textAlign="center" variant="body2" mt={2}>
				Doesn't have an account?{" "}
				<Link href="/auth/register" color="primary">
					Register now
				</Link>
			</Typography>

			<Box display="flex" flexDirection="column" alignItems="center" width="100%">
				<Box display="flex" alignItems="center" width="100%" sx={{ my: 2 }}>
					<Divider sx={{ flexGrow: 1 }} />
					<Typography variant="body2" sx={{ mx: 2, color: "text.secondary", whiteSpace: "nowrap" }}>
						or
					</Typography>
					<Divider sx={{ flexGrow: 1 }} />
				</Box>
				<GoogleAuthButton />
			</Box>
		</Box>
	);
};

export default LoginForm;
