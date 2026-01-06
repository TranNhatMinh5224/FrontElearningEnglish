# ==========================
# Build stage
# ==========================
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_FACEBOOK_APP_ID
ARG REACT_APP_GOOGLE_REDIRECT_URI
ARG REACT_APP_FACEBOOK_REDIRECT_URI
ARG REACT_APP_FRONTEND_URL

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL \
    REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID \
    REACT_APP_FACEBOOK_APP_ID=$REACT_APP_FACEBOOK_APP_ID \
    REACT_APP_GOOGLE_REDIRECT_URI=$REACT_APP_GOOGLE_REDIRECT_URI \
    REACT_APP_FACEBOOK_REDIRECT_URI=$REACT_APP_FACEBOOK_REDIRECT_URI \
    REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL

RUN npm run build

# ==========================
# Production stage
# ==========================
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
