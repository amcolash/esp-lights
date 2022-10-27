# Use node 16
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy source code
COPY ./server/ ./

# Install deps
RUN npm ci

# Set things up
EXPOSE 8266