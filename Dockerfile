FROM node:8.11.1-slim
MAINTAINER Asbjørn Dyhrberg Thegler <devops@deranged.dk>

RUN npm i npm -g

RUN apt-get update
RUN apt-get install git-core -y

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm ci

COPY .git /usr/src/app/.git
RUN echo { \"commit\": \"`git rev-parse HEAD`\" } >> commit.json
RUN rm -rf .git

# Move application code
COPY . /usr/src/app

EXPOSE 4000

ENV NODE_ENV production

CMD [ "node", "start" ]
