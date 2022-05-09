# Dependency Stage
FROM mhart/alpine-node:16

# Create app directory
WORKDIR /usr/src/app

# Copy source code
COPY ./server/ ./

# Install deps
RUN npm ci

# Set things up
EXPOSE 8266