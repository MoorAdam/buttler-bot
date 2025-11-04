FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json (if present)
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Mount the project folder at runtime (for local development)
# The following line is for documentation; actual mounting is done via docker run -v
# VOLUME [ "/usr/src/app" ]

# Expose port (if your app uses one, e.g., 3000)
EXPOSE 3000

# Default command (can be overridden)
# CMD [ "npm", "run", "start" ]