FROM node:22-alpine
WORKDIR /app
COPY API/image-service/package*.json ./
RUN npm install
COPY API/image-service/ ./
COPY generated/grpc ./generated/grpc
EXPOSE 3007
CMD ["npm", "run", "dev"]
