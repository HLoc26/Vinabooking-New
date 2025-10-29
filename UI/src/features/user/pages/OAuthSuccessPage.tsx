import React from "react";
import { useOAuthCallback } from "../hooks/useOAuthCallback";

export const OAuthSuccessPage = () => {
	const { loading, error } = useOAuthCallback();

	if (loading) {
		return (
			<div style={{ textAlign: "center", marginTop: "30vh" }}>
				<h2>Đang xử lý đăng nhập...</h2>
				<p>Vui lòng chờ trong giây lát.</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ textAlign: "center", marginTop: "30vh", color: "red" }}>
				<h2>Đăng nhập thất bại</h2>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div style={{ textAlign: "center", marginTop: "30vh" }}>
			<h2>Đăng nhập thành công</h2>
			<p>Đang chuyển hướng...</p>
		</div>
	);
};
