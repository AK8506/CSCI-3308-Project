# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "index.js"]
