#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URL - Use the External Database URL from the Render dashboard
PG_URI="postgresql://users_db_hf3d_user:dtjLi6JMMxuaUfvXJso1ULifwKw9OuM2@dpg-d00opgadbo4c73di2j90-a.oregon-postgres.render.com/users_db_hf3d"

# Execute each .sql file in the directory
for file in src/init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done