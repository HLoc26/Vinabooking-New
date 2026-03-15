# --- GIAI ĐOẠN 1: THỢ XÂY ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# 1. Sinh client cho Prisma
RUN DATABASE_URL="mysql://fake:fake@localhost:3306/fake" npx prisma generate

# 2. BƯỚC QUYẾT ĐỊNH MẠNG SỐNG: Build từ TypeScript sang JavaScript (Tạo ra thư mục dist)
# (Nhớ đảm bảo trong package.json của mày có script "build": "tsc" nhé)
RUN npm run build 

# --- GIAI ĐOẠN 2: RUNTIME ---
FROM node:20-alpine
WORKDIR /app

RUN apk update && apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# 3. CHỈ LẤY THÀNH QUẢ ĐÃ NẤU CHÍN (Thư mục dist), quăng cái src đi!
COPY --from=builder /app/dist ./dist

# 4. TRẢ LẠI BẢN ĐỒ CHO THẰNG tsconfig-paths
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000
CMD ["npm", "start"]