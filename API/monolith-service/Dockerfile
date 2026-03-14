# --- GIAI ĐOẠN 1: THỢ XÂY (BUILDER) ---
# Dùng Node 20/22 thoải mái để chiều lòng thằng Prisma
FROM node:22-bullseye-slim AS builder
WORKDIR /app

# Cài đồ nghề để biên dịch Sharp cho CPU đồ cổ
RUN apt-get update && apt-get install -y python3 make g++ libvips-dev
ENV npm_config_build_from_source=true

COPY package*.json ./
# Cài sạch sẽ node_modules
RUN npm install

COPY . .
# Tạo Prisma Client ở Node 22 (GitHub Cloud gánh)
RUN npx prisma generate

# --- GIAI ĐOẠN 2: THẰNG THỰC THI (RUNTIME) ---
# Quay về Node 18 để né lỗi x86_64-v2 trên Home Server
FROM node:18-bullseye-slim
WORKDIR /app

# Cài library cần thiết để Prisma/Sharp chạy được (openssl, libvips)
RUN apt-get update && apt-get install -y openssl libvips42 && rm -rf /var/lib/apt/lists/*

# Bốc cái node_modules đã có Prisma Client (từ Node 22) sang Node 18
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["npm", "start"]