import { createClient } from '@supabase/supabase-js';

// Replace string with your Supabase Anon Key (or Service Role Key) from your Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https://db.smujmccdavjucdtwnqgt.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('Testing connection to Supabase...');

    // Try querying common table names like 'movies' or list available tables if permissions allow
    const tablesToTry = ['movies', 'movie', 'films', 'media'];

    for (const tableName of tablesToTry) {
        console.log(`Trying table: ${tableName}...`);
        const { data, error } = await supabase.from(tableName).select('*').limit(1);

        if (!error) {
            console.log(`✅ Success fetching from table "${tableName}":`);
            console.log(data);
            return;
        } else {
            console.log(`❌ Table "${tableName}" query response:`, error.message);
        }
    }
}

testConnection();
