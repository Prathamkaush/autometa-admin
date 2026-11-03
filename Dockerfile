FROM node:22-bookworm-slim
WORKDIR /app/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci
COPY admin /app/admin
COPY backend/packages/shared-types /app/backend/packages/shared-types
COPY backend/packages/web-proxy /app/backend/packages/web-proxy
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm","run","dev"]
