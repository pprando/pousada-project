FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Set environment variables
ENV VITE_SUPABASE_URL=""
ENV VITE_SUPABASE_ANON_KEY=""

# Build the app
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

EXPOSE 5173

# Development mode
CMD ["npm", "run", "dev", "--", "--host"]