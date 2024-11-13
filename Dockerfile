FROM node:22-alpine AS build

ARG BASE_URI
ARG BASE_PATH=/api/v1
ARG PUBLIC_URI

ENV BASE_URI=${BASE_URI}
ENV BASE_PATH=${BASE_PATH}
ENV PUBLIC_URI=${PUBLIC_URI}

WORKDIR /usr/src/app

COPY . .

RUN npm install \
    && npm run build:tsc

FROM node:22-alpine

ARG PORT=3001

ENV PORT=${PORT}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

RUN npm install --only=production

EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]