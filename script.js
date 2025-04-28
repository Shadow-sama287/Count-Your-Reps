const supabaseUrl = 'https://doqdmloolofjntckomar.supabase.co'; // Replace with your API URL
   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcWRtbG9vbG9mam50Y2tvbWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTkxMTUsImV4cCI6MjA2MTQzNTExNX0.UWjotozpwacn2u_OKvzSAGLkKYq0q7eyJPGEFq8Ih8s'; // Replace with your Anon Public Key
   // Ensure Supabase is loaded before initializing
   if (typeof Supabase === 'undefined') {
     console.error('Supabase library not loaded');
     alert('Error: Supabase library failed to load. Please refresh the page.');
   } else {
     const supabase = Supabase.createClient(supabaseUrl, supabaseKey);
   
     async function signInWithGoogle() {
       if (!supabase) {
         console.error('Supabase client is not initialized');
         alert('Error: Supabase client is not initialized. Please check your setup.');
         return;
       }
   
       try {
         const { data, error } = await supabase.auth.signInWithOAuth({
           provider: 'google'
         });
         if (error) {
           console.error('Error:', error);
           alert('Login failed: ' + error.message);
         } else {
           console.log('Login initiated:', data);
           // The redirect will happen automatically after successful login
         }
       } catch (err) {
         console.error('Unexpected error during sign-in:', err);
         alert('An unexpected error occurred during login. Please try again.');
       }
     }
   
     async function updateReps(type) {
       const pushups = document.getElementById('pushups-input').value || 0;
       const squats = document.getElementById('squats-input').value || 0;
       const situps = document.getElementById('situps-input').value || 0;
   
       document.getElementById('pushups').innerText = pushups + " Reps";
       document.getElementById('squats').innerText = squats + " Reps";
       document.getElementById('situps').innerText = situps + " Reps";
   
       const { data: userData, error: userError } = await supabase.auth.getUser();
       if (userError || !userData?.user) {
         alert("Please sign in first");
         return;
       }
   
       const user = userData.user;
       const today = new Date().toISOString().split('T')[0];
       const { data, error } = await supabase
         .from('reps')
         .upsert([
           { user_id: user.id, date: today, pushups: parseInt(pushups), squats: parseInt(squats), situps: parseInt(situps) }
         ]);
       if (error) console.error('Error saving:', error);
       else console.log('Saved:', data);
     }
   
     async function loadReps() {
       const { data: userData, error: userError } = await supabase.auth.getUser();
       if (userError || !userData?.user) return;
   
       const user = userData.user;
       const today = new Date().toISOString().split('T')[0];
       const { data, error } = await supabase
         .from('reps')
         .select('*')
         .eq('user_id', user.id)
         .eq('date', today)
         .single();
   
       if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
         console.error('Error loading:', error);
       } else if (data) {
         document.getElementById('pushups').innerText = data.pushups + " Reps";
         document.getElementById('squats').innerText = data.squats + " Reps";
         document.getElementById('situps').innerText = data.situps + " Reps";
       }
     }
   
     function setTodayDate() {
       const today = new Date();
       const formattedDate = today.toLocaleDateString('en-GB', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric'
       }).split('/').join('-');
       document.getElementById('today-date').innerText = `Today (${formattedDate})`;
     }
   
     // Check user session on page load and show reps section if logged in
     window.onload = async () => {
       setTodayDate();
       const { data: userData } = await supabase.auth.getUser();
       if (userData?.user) {
         document.getElementById('login').style.display = 'none';
         document.getElementById('repsSection').style.display = 'block';
         loadReps();
       }
     };
   }