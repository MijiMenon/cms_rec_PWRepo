# Dockerfile for Playwright Test Automation Framework

FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Install browsers (already included in base image, but ensure latest)
RUN npx playwright install --with-deps

# Create necessary directories
RUN mkdir -p logs screenshots reports test-results allure-results

# Set environment variables
ENV CI=true
ENV HEADLESS=true

# Run tests by default
CMD ["npm", "test"]

# Alternative commands:
# docker run <image> npm run test:chromium
# docker run <image> npm run test:smoke
# docker run <image> npm run test:parallel
