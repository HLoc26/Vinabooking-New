FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3005

CMD ["npm", "run", "dev"]
