FROM node:16.10-alpine3.11 AS build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn gen:api
RUN yarn build

FROM nginx:1.25.2
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/nginx.conf