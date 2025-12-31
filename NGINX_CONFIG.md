# Nginx Configuration for Incentive IQ

Add the following location block to your nginx server configuration:

```nginx
# --- IncentiveIQ ---
location ~ ^/apps/incentive-iq(/.*|$) {
    proxy_pass http://127.0.0.1:3006;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support (if needed)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## Complete nginx server block example:

```nginx
server {
    listen 80;
    server_name staging.mysaarathi.in 10.40.30.79 localhost;

    # --- BranchIQ ---
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- CollectionSIQ ---
    location ~ ^/apps/collectionsiq(/.*|$) {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- Pravesh ---
    location ~ ^/apps/pravesh(/.*|$) {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # --- IncentiveIQ ---
    location ~ ^/apps/incentive-iq(/.*|$) {
        proxy_pass http://127.0.0.1:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # --- Fallback for unknown paths ---
   # location / {
   #     return 404;
   # }
}
```

## Docker Build and Run Commands:

```bash
# Build the Docker image
docker build -t incentive-iq:latest .

# Run the container
docker run -d \
  --name incentive-iq \
  -p 3006:3006 \
  --restart unless-stopped \
  incentive-iq:latest
```

## Environment Variables:

If you need to set environment variables, you can add them to the docker run command:

```bash
docker run -d \
  --name incentive-iq \
  -p 3006:3006 \
  -e NEXT_PUBLIC_API_BASE_URL=https://staging-api.mysaarathi.in \
  --restart unless-stopped \
  incentive-iq:latest
```

Or use a `.env` file (make sure to copy it in Dockerfile if needed):

```bash
docker run -d \
  --name incentive-iq \
  -p 3006:3006 \
  --env-file .env.production \
  --restart unless-stopped \
  incentive-iq:latest
```

