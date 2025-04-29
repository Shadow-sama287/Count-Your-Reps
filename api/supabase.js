// api/supabase.js
export default async (req, res) => {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
  
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase environment variables not set' });
    }
  
    const supabase = createClient(supabaseUrl, supabaseKey);
    res.status(200).json({ message: 'Supabase initialized' });
  };