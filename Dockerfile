FROM node:14

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Install Instaloader
RUN pip3 install instaloader

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]