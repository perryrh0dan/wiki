FROM node:10

# Move our files into directory name "app"
WORKDIR /var/wiki
COPY package.json package-lock.json  /var/wiki/
RUN cd /var/wiki && npm install
COPY .  /var/wiki

EXPOSE 4000
CMD ["node", "server.js"]