FROM mcr.microsoft.com/playwright:v1.56.0-jammy 

WORKDIR /app

RUN apt-get update && apt-get install -y xvfb

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "npx playwright test"]
