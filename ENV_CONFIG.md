# Environment Configuration

## Environment Variables

The application uses environment variables for configuration. All environment variables are optional and have default values.

### Required Environment Variables

**None** - The app will work with default values, but you should configure these for different environments.

### Optional Environment Variables

#### `NEXT_PUBLIC_API_BASE_URL`

- **Description**: The base URL for the backend API
- **Default**: `https://staging-api.mysaarathi.in`
- **Example Values**:
  - Staging: `https://staging-api.mysaarathi.in`
  - Production: `https://api.mysaarathi.in`
  - Local Development: `http://localhost:8000`

### Setting Up Environment Variables

1. **Create a `.env.local` file** in the root directory of `next-incentive-api/`:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_BASE_URL=https://staging-api.mysaarathi.in
   ```

2. **For different environments**, you can create:
   - `.env.local` - Local development (gitignored)
   - `.env.development` - Development environment
   - `.env.production` - Production environment

3. **Restart the development server** after changing environment variables:
   ```bash
   npm run dev
   ```

### Current Configuration

The app currently uses the following default:
- **API Base URL**: `https://staging-api.mysaarathi.in`

This is hardcoded as a fallback in the following files:
- `src/lib/api.ts`
- `src/lib/auth.ts`
- `src/lib/incentive-api.ts`
- `src/app/api/auth/login/route.ts`

### Docker Deployment

When deploying with Docker, you can pass environment variables:

```bash
docker run -d \
  --name incentive-iq \
  -p 3006:3006 \
  -e NEXT_PUBLIC_API_BASE_URL=https://staging-api.mysaarathi.in \
  --restart unless-stopped \
  incentive-iq:latest
```

Or use an `.env` file:

```bash
docker run -d \
  --name incentive-iq \
  -p 3006:3006 \
  --env-file .env.production \
  --restart unless-stopped \
  incentive-iq:latest
```

### Notes

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- `.env.local` files are gitignored and should not be committed
- The app will work without any `.env` file due to default fallback values

