FROM node:16.10-alpine3.11
WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn
VOLUME [ "/app/node_modules" ]

CMD ["yarn", "dev", "--host"]
