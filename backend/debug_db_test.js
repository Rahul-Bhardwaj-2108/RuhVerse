import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ithzfjcjiefjbektvjbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHpmamNqaWVmamJla3R2amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDc1NDQsImV4cCI6MjA4NTk4MzU0NH0.nSVo597pyV0HsAnB-8ebkIbTDR9ADsm27ujeM7z6BeQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log("Testing Supabase Connection...");

    // 1. Fetch count
    const { count, error: countError } = await supabase
        .from('shayaris')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("❌ Count Error:", countError);
    } else {
        console.log(`✅ Total Rows in 'shayaris': ${count}`);
    }

    // 2. Fetch recent rows
    const { data, error } = await supabase
        .from('shayaris')
        .select(`
            id,
            content,
            author_name,
            profiles ( is_admin )
        `)
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("❌ Fetch Error:", error);
    } else {
        console.log("✅ Recent Data:", JSON.stringify(data, null, 2));
    }
}

testConnection();
