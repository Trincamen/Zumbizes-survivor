FROM node:20-alpine
WORKDIR /app
COPY server.js game.html ./
ENV PORT=4040
EXPOSE 4040
CMD ["node", "server.js"]
