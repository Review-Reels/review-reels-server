FROM node:12

WORKDIR /app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent 

COPY . .

RUN npm install @prisma/client
RUN npm install @prisma/migrate

RUN prisma migrate deploy 

RUN npm install -g nodemon

CMD npm start

