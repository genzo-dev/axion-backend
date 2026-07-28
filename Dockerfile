# ===== DEVELOPMENT STAGE AND TEST STAGE =====

FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

# ===== BUILD STAGE =====

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ===== STAGING STAGE (LOCAL) =====

FROM node:20-alpine AS staging

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]