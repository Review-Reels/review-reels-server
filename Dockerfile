FROM node:14
  
WORKDIR /app

COPY package.json .

COPY . .

RUN npm install --production --silent


# RUN npm i -D prisma
# RUN  prisma generate  --schema=./prisma/schema.prisma
# RUN npm install @prisma/client
# RUN npm install @prisma/migrate

RUN npx prisma migrate deploy

RUN npm install -g nodemon

#RUN apt-get update ; apt-get install -y git build-essential gcc make yasm autoconf automake cmake libtool checkinstall libmp3lame-dev pkg-config libunwind-dev zlib1g-dev libssl-dev

RUN apt-get update
RUN apt-get clean
RUN apt-get install -y ffmpeg

RUN mkdir thumbnail

CMD npm start