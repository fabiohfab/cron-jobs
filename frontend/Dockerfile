FROM node:16.20.1

WORKDIR /var/www/app

COPY package.json ./package.json

RUN yarn install

COPY public /var/www/app/public
COPY src /var/www/app/src

CMD ["sh", "-c", "yarn install; yarn start"]