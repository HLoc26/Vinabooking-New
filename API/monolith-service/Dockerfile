# --- GIAI ĐOẠN 1: THỢ XÂY (BUILDER) ---
# Dùng bản alpine3.19 để có libvips đời mới nhất
FROM node:22-alpine3.19 AS builder
WORKDIR /app

# Cài đồ nghề bằng apk của Alpine (Siêu nhẹ, siêu mới)
RUN apk update && apk add --no-cache python3 make g++ vips-dev pkgconfig

ENV npm_config_build_from_source=true

COPY package*.json ./
# Cài npm bình thường, nó sẽ nuốt trôi cục sharp nhờ có libvips xịn
RUN npm install --no-audit --no-fund

COPY . .
RUN npx prisma generate


# --- GIAI ĐOẠN 2: THẰNG THỰC THI (RUNTIME) ---
# Trở về Node 18, giữ nguyên alpine3.19 để né lỗi CPU server
FROM node:18-alpine3.19
WORKDIR /app

# Chỉ cài vips và openssl (cho Prisma) để chạy, không cần g++ nữa
RUN apk update && apk add --no-cache vips openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["npm", "start"]