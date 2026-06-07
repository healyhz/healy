FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/

CMD ["/bin/sh", "-c", "envsubst '${API_URL} ${APP_URL} ${LANDING_URL}' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
