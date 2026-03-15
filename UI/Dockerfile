FROM node:22-alpine as build

WORKDIR /app

ARG VITE_MODE
ENV VITE_MODE=$VITE_MODE

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build -- --mode $VITE_MODE

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]