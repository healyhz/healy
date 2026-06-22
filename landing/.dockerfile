FROM node:26-alpine AS builder

WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

CMD ["npm", "run", "serve"]
