FROM node:22-alpine
WORKDIR /app
COPY API/email-service/package*.json ./
RUN npm install
COPY API/email-service/ ./
EXPOSE 3008
CMD ["npm", "run", "dev"]
