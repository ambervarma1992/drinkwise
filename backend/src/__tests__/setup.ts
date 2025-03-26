import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key'; 