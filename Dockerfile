# Stage 1: build using node
FROM node:8.11.4 as buildapp
WORKDIR "/app"

COPY package.json /app/

#Hack because the npm run build uses a plugin to setup a build version based on the git repo
#We should revisit how better to reorganize this
COPY .git /app/.git 

# verify cache to prevent checksum error on npm install
RUN cd /app; npm cache verify; npm install

COPY app.js /app/
COPY .babelrc /app/
COPY config /app/config
COPY .eslintignore /app/
COPY .eslintrc.json /app/
COPY lib /app/lib
COPY server /app/server
COPY templates /app/templates
COPY nls /app/nls
COPY fonts /app/fonts
COPY graphics /app/graphics
COPY scss /app/scss
COPY src-web /app/src-web
COPY webpack.config.js /app/
COPY webpack.dll.js /app/
COPY version.ejs /app/
COPY views /app/views

RUN cd /app; npm run build:production; npm prune; rm -rf .git

# Stage 2: Run node server
FROM registry.access.redhat.com/ubi7/nodejs-8:1-47

LABEL name="Application Navigator" \
      vendor="kAppNav" \
      version="1.0.0" \
      release="1.0.0" \
      summary="UI image for Application Navigator" \
      description="This image contains the UI for Application Navigator"

USER root
RUN yum -y remove mariadb-devel
RUN mkdir -p /opt/ibm/kappnav-ui/app && chown -R 1001:0 /opt/ibm
COPY --chown=1001:0 licenses/ /licenses/
WORKDIR /opt/ibm/kappnav-ui/app

COPY --from=buildapp --chown=1001:0 /app/app.js .
COPY --from=buildapp --chown=1001:0 /app/config ./config
COPY --from=buildapp --chown=1001:0 /app/lib ./lib
COPY --from=buildapp --chown=1001:0 /app/nls ./nls
COPY --from=buildapp --chown=1001:0 /app/node_modules ./node_modules
COPY --from=buildapp --chown=1001:0 /app/server ./server
COPY --from=buildapp --chown=1001:0 /app/package.json .
COPY --from=buildapp --chown=1001:0 /app/public ./public
COPY --from=buildapp --chown=1001:0 /app/templates ./templates
COPY --from=buildapp --chown=1001:0 /app/views ./views

USER 1001
ENV PORT 3000

ENV NODE_ENV production
CMD ["node", "app.js"]
