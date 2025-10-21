import express from "express";
import proxy from "express-http-proxy";
import "dotenv/config";

const app = express();
app.use(express.json());

function createProxy(target) {
    return proxy(target, {
        userResDecorator: async (proxyRes, proxyResData, _userReq, _userRes) => {
            const contentType = proxyRes.headers["content-type"] || "";

            // Nếu là HTML hoặc text thuần => lỗi từ downstream
            if (contentType.includes("text/html") || contentType.includes("text/plain")) {
                const text = proxyResData.toString("utf8");
                return JSON.stringify({
                    success: false,
                    data: null,
                    error: extractErrorMessage(text),
                });
            }

            try {
                const data = JSON.parse(proxyResData.toString("utf8"));

                // Nếu đã đúng format chuẩn
                if (data && typeof data === "object" && "success" in data && "data" in data && "error" in data) {
                    return JSON.stringify(data);
                }

                // Trường hợp JSON raw
                return JSON.stringify({
                    success: true,
                    data,
                    error: null,
                });
            } catch (err) {
                // Không parse được JSON → xem như lỗi
                return JSON.stringify({
                    success: false,
                    data: null,
                    error: `Invalid or non-JSON response from service ${err}`,
                });
            }
        },
    });
}

// Helper: trích lỗi từ HTML
function extractErrorMessage(html) {
    // Express mặc định trả kiểu: "<!DOCTYPE html>...Cannot GET /xxx"
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
