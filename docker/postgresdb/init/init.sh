#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE users (
        user_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
        user_uuid uuid DEFAULT uuid_generate_v1 (),
        user_name VARCHAR (50) UNIQUE NOT NULL,
        password VARCHAR (60) NOT NULL,
        refresh_tokens VARCHAR[],
        first_name VARCHAR (50),  
        last_name VARCHAR (50),
        profile_img_url VARCHAR (2000)
    );
EOSQL
