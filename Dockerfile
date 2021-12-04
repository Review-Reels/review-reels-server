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

CMD npm start

