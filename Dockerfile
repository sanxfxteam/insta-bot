FROM node:20

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip pipx

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]