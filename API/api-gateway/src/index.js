import express from "express";
import proxy from "express-http-proxy";
import "dotenv/config";

const app = express();
app.use(express.json());

function createProxy(target) {
    return proxy(target, {
        userResDecorator: async (proxyRes, proxyResData) => {
            const contentType = proxyRes.headers["content-type"] || "";

            if (contentType.includes("text/html") || contentType.includes("text/plain")) {
                const text = proxyResData.toString("utf8");
                return JSON.stringify({
                    success: false,
                    data: null,
                    error: extractErrorMessage(text),
                });
            }

            try {
                const raw = JSON.parse(proxyResData.toString("utf8"));

                // Nếu đã đúng chuẩn ApiResponse
                if (raw && typeof raw === "object" && "success" in raw && "data" in raw && "error" in raw) {
                    return JSON.stringify(raw);
                }

                if (raw && typeof raw === "object" && "success" in raw) {
                    if (raw.success === true) {
                        // success: true => mọi field khác là data
                        const { success, ...rest } = raw;
                        return JSON.stringify({
                            success: true,
                            data: Object.keys(rest).length ? rest : null,
                            error: null,
                        });
                    } else {
                        // success: false => lấy message nếu có
                        return JSON.stringify({
                            success: false,
                            data: null,
                            error: raw.message || "Unknown error",
                        });
                    }
                }

                // Trường hợp JSON raw bình thường
                return JSON.stringify({
                    success: true,
                    data: raw,
                    error: null,
                });
            } catch {
                return JSON.stringify({
                    success: false,
                    data: null,
                    error: "Invalid or non-JSON response from service",
                });
            }
        },
    });
}

function extractErrorMessage(html) {
    const match = html.match(/Cannot\s+\w+\s+\/[^\s<]+/i);
    if (match) return match[0];
    if (html.includes("Error")) return "Internal Server Error";
    return "Unknown downstream service error";
}

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/health", (req, res) => {
    res.json({ success: true, data: { service: "API Gateway" }, error: null });
});

app.use("/accommodations", createProxy(process.env.ACCOMMODATION_ENDPOINT));
app.use("/auth", createProxy(process.env.AUTH_ENDPOINT));
app.use("/bookings", createProxy(process.env.BOOKING_ENDPOINT));
app.use("/reviews", createProxy(process.env.REVIEW_ENDPOINT));
app.use("/rooms", createProxy(process.env.ROOM_ENDPOINT));
app.use("/users", createProxy(process.env.USER_ENDPOINT));

app.listen(3000, () => console.log("API Gateway running on port 3000"));
