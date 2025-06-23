FROM caddy:latest
COPY frontend-build /srv/frontend
COPY Caddyfile /etc/caddy/Caddyfile


