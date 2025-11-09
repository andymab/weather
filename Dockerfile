FROM node:latest AS dev

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

# dev сервер запущен локально, нужен доступ снаружи
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
