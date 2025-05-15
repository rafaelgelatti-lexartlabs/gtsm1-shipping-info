FROM node:22.12.0-alpine3.21

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]