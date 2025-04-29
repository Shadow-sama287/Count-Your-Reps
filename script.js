// Global variables
let supabase = null;
let selectedDate = new Date().toISOString().split('T')[0]; // Track the currently selected date

function initializeSupabase() {
  const supabaseUrl = 'https://doqdmloolofjntckomar.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcWRtbG9vbG9mam50Y2tvbWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTkxMTUsImV4cCI6MjA2MTQzNTExNX0.UWjotozpwacn2u_OKvzSAGLkKYq0q7eyJPGEFq8Ih8s';

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase initialized successfully');
  } else {
    console.error('Supabase library not loaded or incompatible');
    alert('Error: Supabase library failed to load. Please refresh the page.');
  }
}

// Initialize Supabase when the page loads
document.addEventListener('DOMContentLoaded', initializeSupabase);

async function signInWithGoogle() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    alert('Error: Supabase client not initialized. Please refresh the page.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error('Error:', error);
      alert('Login failed: ' + error.message);
    } else {
      console.log('Login initiated:', data);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const user = userData.user;
      document.getElementById('login').style.display = 'none';
      document.getElementById('repsSection').style.display = 'block';
      loadReps();
      if (user.user_metadata && user.user_metadata.avatar_url) {
        document.querySelector('.profile-icon').style.backgroundImage = `url(${user.user_metadata.avatar_url})`;
        document.querySelector('.profile-icon').style.backgroundSize = 'cover';
      }
    }
  } catch (err) {
    console.error('Unexpected error during sign-in:', err);
    alert('An unexpected error occurred during login. Please try again.');
  }
}

async function updateReps(type) {
  if (!supabase) {
    alert('Please sign in and refresh the page to initialize Supabase.');
    return;
  }

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
    .upsert(
      { user_id: user.id, date: today, pushups: parseInt(pushups), squats: parseInt(squats), situps: parseInt(situps) },
      { onConflict: ['user_id', 'date'] }
    );
  if (error) console.error('Error saving:', error);
  else console.log('Saved:', data);
  loadReps(); // Refresh display after saving
}

async function loadRepsForDate() {
  const datePicker = document.getElementById('date-picker');
  selectedDate = datePicker.value; // Update the selected date

  if (!supabase) return;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return;

  const user = userData.user;
  const { data, error } = await supabase
    .from('reps')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', selectedDate)
    .maybeSingle();

  if (error) {
    console.error('Error loading:', error);
    return;
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');

  let dateLabel = `(${formattedDate})`;
  if (selectedDate === todayStr) {
    dateLabel = `Today (${formattedDate})`;
  } else if (selectedDate === yesterdayStr) {
    dateLabel = `Yesterday (${formattedDate})`;
  }

  const saveButtons = [
    document.getElementById('pushups-save'),
    document.getElementById('squats-save'),
    document.getElementById('situps-save')
  ];
  const inputFields = [
    document.getElementById('pushups-input'),
    document.getElementById('squats-input'),
    document.getElementById('situps-input')
  ];
  const viewOnlyLabel = document.getElementById('view-only-label');

  if (data) {
    document.getElementById('pushups').innerText = data.pushups + " Reps";
    document.getElementById('squats').innerText = data.squats + " Reps";
    document.getElementById('situps').innerText = data.situps + " Reps";
  } else {
    document.getElementById('pushups').innerText = "0 Reps";
    document.getElementById('squats').innerText = "0 Reps";
    document.getElementById('situps').innerText = "0 Reps";
  }
  document.getElementById('today-date').innerText = dateLabel;

  // Show or hide Save buttons, input fields, and View Only label based on whether the selected date is today
  if (selectedDate === todayStr) {
    saveButtons.forEach(button => button.style.display = 'block');
    inputFields.forEach(input => input.style.display = 'block');
    viewOnlyLabel.style.display = 'none';
  } else {
    saveButtons.forEach(button => button.style.display = 'none');
    inputFields.forEach(input => input.style.display = 'none');
    viewOnlyLabel.style.display = 'block';
  }

  if (user.user_metadata && user.user_metadata.avatar_url) {
    document.querySelector('.profile-icon').style.backgroundImage = `url(${user.user_metadata.avatar_url})`;
    document.querySelector('.profile-icon').style.backgroundSize = 'cover';
  }
}

async function loadReps() {
  await loadRepsForDate(); // Load reps for the initially selected date (today)
}

function setTodayDate() {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('date-picker').value = formattedDate; // Set date picker to today
  document.getElementById('today-date').innerText = `Today (${today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-')})`;
}

// Check session on page load and update UI
window.onload = async () => {
  setTodayDate();
  if (supabase) {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error checking user session:', error);
      return;
    }
    if (userData?.user) {
      document.getElementById('login').style.display = 'none';
      document.getElementById('repsSection').style.display = 'block';
      loadReps();
    }
  }
};