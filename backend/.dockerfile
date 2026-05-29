FROM node:26-alpine

WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci
COPY . .

CMD ["npm", "start"]
