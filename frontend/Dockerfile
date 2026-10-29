# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
COPY frontend ./frontend

RUN npm install
RUN cd frontend && npm run build


# Stage 2: serve
FROM node:20-alpine

WORKDIR /usr/src/app/frontend

COPY --from=builder /usr/src/app/frontend/dist ./dist

RUN npm install -g http-server

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200"]


