# DrinkWise Backend

This is the backend service for the DrinkWise application, built with Node.js, Express, TypeScript, and Supabase.

## Prerequisites

- Node.js (v14 or higher)
- Supabase account
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL="your-supabase-project-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   PORT=3001
   NODE_ENV="development"
   ```

4. Set up your Supabase project:
   - Create a new project at https://supabase.com
   - Get your project URL and anon key from the project settings
   - Create the necessary tables in the Supabase dashboard

## Development

To start the development server with hot reload:
```bash
npm run dev
```

## Production

To build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/test` - Test Supabase connection

## Testing

To run tests:
```bash
npm test
```

## License

ISC 