FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

CMD ["/bin/sh", "-c", "envsubst '${APP_URL}' < /usr/share/nginx/html/config.js > /tmp/config.js && cp /tmp/config.js /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
