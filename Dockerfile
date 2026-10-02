FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY server ./server
COPY client ./client
RUN cd client && npm run build
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server/server.js"]
