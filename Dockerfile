FROM node:22

# Declare build-time arguments with default values
ARG PORT=3001
ARG BASE_URI
ARG BASE_PATH=/api/v1
ARG PUBLIC_URI

# Set environment variables
ENV PORT=${PORT}
ENV BASE_URI=${BASE_URI}
ENV BASE_PATH=${BASE_PATH}
ENV PUBLIC_URI=${PUBLIC_URI}

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build:tsc

EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]