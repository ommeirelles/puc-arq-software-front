# Use Node.js LTS version as base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Expose port 5173 (Vite's default port)
EXPOSE 4173

# Start the application
CMD ["npm", "run", "preview", "--", "--host"]
