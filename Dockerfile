FROM node:latest
WORKDIR /
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "index.js"]
