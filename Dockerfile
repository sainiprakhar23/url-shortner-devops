# Base Node.js image
FROM node:20-alpine

# Create working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy project files
COPY . .

# Expose backend port
EXPOSE 8000

# Start backend server
CMD ["node", "index.js"]