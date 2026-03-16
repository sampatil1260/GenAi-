# ── Stage 1: Build ─────────────────────────────────���─────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Set the API URL for the production build
ENV REACT_APP_API_URL=http://localhost:8000/api/v1

RUN npm run build

# ── Stage 2: Serve with nginx ───────────────────────────────────
FROM nginx:alpine

# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]