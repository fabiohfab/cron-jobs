FROM node:16.20.1

WORKDIR /var/www/api

COPY package.json ./package.json

RUN yarn install

COPY index.js /var/www/api/index.js

CMD ["sh", "-c", "yarn install; yarn start"]