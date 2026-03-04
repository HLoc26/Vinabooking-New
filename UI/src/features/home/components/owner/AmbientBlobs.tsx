import { Box } from "@mui/material";

const AmbientBlobs = () => (
	<Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
		<Box
			sx={{
				position: "absolute",
				top: "-20%",
				right: "-10%",
				width: 700,
				height: 700,
				borderRadius: "50%",
				background: "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)",
				filter: "blur(40px)",
			}}
		/>
		<Box
			sx={{
				position: "absolute",
				bottom: "-30%",
				left: "-15%",
				width: 800,
				height: 800,
				borderRadius: "50%",
				background: "radial-gradient(circle, rgba(78,205,196,0.07) 0%, transparent 70%)",
				filter: "blur(60px)",
			}}
		/>
		<Box
			sx={{
				position: "absolute",
				top: "40%",
				left: "45%",
				width: 400,
				height: 400,
				borderRadius: "50%",
				background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
				filter: "blur(30px)",
			}}
		/>
	</Box>
);
export default AmbientBlobs;
