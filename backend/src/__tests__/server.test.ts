import request from 'supertest';
import express from 'express';
import { supabase } from '../lib/supabase';

const app = express();

describe('Server Health Check', () => {
  it('should return 200 OK for health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('Supabase Connection', () => {
  it('should connect to Supabase successfully', async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBeTruthy();
  });
}); 