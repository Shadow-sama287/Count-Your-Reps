// api/supabase.js
const { createClient } = require('@supabase/supabase-js');

export default async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase environment variables not set' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Optionally, you can handle authentication here
  // For example, check if a user session exists
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    return res.status(500).json({ error: 'Failed to get session' });
  }

  res.status(200).json({ message: 'Supabase initialized', session });
};