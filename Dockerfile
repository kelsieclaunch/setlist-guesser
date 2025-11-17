# Use Node 20 LTS
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose the port Cloud Run will use
ENV PORT=8080
EXPOSE 8080

# Run the app
CMD ["node", "server.js"]
