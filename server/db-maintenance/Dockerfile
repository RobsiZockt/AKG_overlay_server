FROM node:20

RUN apt-get update \
    && apt-get install -y postgresql-common ca-certificates \
    && /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y \
    && apt-get update \
    && apt-get install -y postgresql-client-18 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app



COPY prefire.js .

CMD ["node", "prefire.js"]