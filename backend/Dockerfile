FROM node:24.1.0-alpine3.20

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "run", "dev"]
