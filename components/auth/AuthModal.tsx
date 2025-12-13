import { supabase } from '../../services/supabaseClient';

const handleFinish = async () => {
  try {
    // Create the user in Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email: formData.email!,
      password: formData.password!
    });

    if (authError) throw authError;
    if (!user) throw new Error("Failed to create user");

    // Create a profile row in 'profiles' table
    const profile = {
      id: user.id,
      email: user.email,
      display_name: formData.name,
      zipCode: formData.zipCode,
      hardinessZone: formData.hardinessZone,
      experienceLevel: formData.experienceLevel,
      goals: formData.goals,
      interests: formData.interests,
      preferences: formData.preferences,
      role: 'owner'
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (profileError) throw profileError;

    onComplete();
  } catch (err) {
    console.error(err);
    alert('Account creation failed: ' + (err as any).message);
  }
};
