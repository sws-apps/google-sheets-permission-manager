# Build stage for React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/tsconfig.json ./

# Build React app
RUN npm run build

# Build stage for TypeScript backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

WORKDIR /app

# Copy built backend from build stage
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY backend/tsconfig.json ./backend/

# Copy built React app from build stage
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy any config files needed
COPY backend/.env.example ./backend/.env.example

# Create wrapper script to serve both
RUN echo '#!/bin/sh' > start.sh && \
    echo 'cd /app/backend' >> start.sh && \
    echo 'node dist/index.js &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Simple static server for frontend if backend doesnt serve it' >> start.sh && \
    echo 'cd /app' >> start.sh && \
    echo 'npx -y serve -s frontend/build -l 3000 &' >> start.sh && \
    echo 'FRONTEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo 'trap "kill $BACKEND_PID $FRONTEND_PID" EXIT' >> start.sh && \
    echo 'wait' >> start.sh && \
    chmod +x start.sh

# Install serve globally for frontend
RUN npm install -g serve

# Environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=5000
ENV FRONTEND_PORT=3000

# Expose ports
EXPOSE 5000 3000

# Health check for backend
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start both services
CMD ["./start.sh"]