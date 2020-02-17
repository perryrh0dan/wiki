FROM node:alpine as builder

# prod|sandbox its value will be come from outside
ARG env=prod

RUN apk update && apk add --no-cache make git

# Move our files into directory name "app"
WORKDIR /app
COPY package.json /app/package.json
RUN npm install @angular/cli@9.0.2 -g
COPY .  .
RUN npm install --silent

# Build with $env variable from outside
RUN npm run build:$env

# Build a small nginx image with static website
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
