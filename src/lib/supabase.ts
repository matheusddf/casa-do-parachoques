import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  // Explicitly check for known keys to allow Vite to perform build-time replacement
  if (key === 'SUPABASE_URL') {
    return process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
  }
  if (key === 'SUPABASE_ANON_KEY') {
    return process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
  if (key === 'GEMINI_API_KEY') {
    return process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
  }
  return '';
};

let supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Clean up Supabase URL if user pasted the REST endpoint by mistake
if (supabaseUrl && supabaseUrl.includes('/rest/v1')) {
  supabaseUrl = supabaseUrl.split('/rest/v1')[0];
}
// Remove trailing slash if present
if (supabaseUrl && supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

// Verify if they are actual strings and not 'undefined' placeholder
const isValid = (val: any) => val && typeof val === 'string' && val !== 'undefined' && val.length > 5;

if (!isValid(supabaseUrl) || !isValid(supabaseAnonKey)) {
  const missing = [];
  if (!isValid(supabaseUrl)) missing.push('SUPABASE_URL');
  if (!isValid(supabaseAnonKey)) missing.push('SUPABASE_ANON_KEY');
  console.error(`Supabase credentials missing or invalid: ${missing.join(', ')}. Check your AI Studio Secrets.`);
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const BUCKET_NAME = 'part-images';
