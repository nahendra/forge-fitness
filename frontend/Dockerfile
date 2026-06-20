# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# Same-origin deployment (nginx proxies /api/* to the backend container) —
# override at build time only if the frontend is deployed separately from the API.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
