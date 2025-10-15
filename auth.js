import { supabase } from './src/integrations/supabase/client.ts';

let isSignUp = false;

// Initialize auth page
function initAuth() {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    const form = document.getElementById('authForm');
    const toggleModeBtn = document.getElementById('toggleMode');
    const passwordToggle = document.getElementById('passwordToggle');

    form.addEventListener('submit', handleAuth);
    toggleModeBtn.addEventListener('click', toggleAuthMode);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
}

// Handle sign in / sign up
async function handleAuth(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('authSubmit');
    const submitText = document.getElementById('submitText');

    // Basic validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitText.textContent = isSignUp ? 'Creating account...' : 'Signing in...';

    try {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) throw error;

            if (data.user && data.session) {
                showMessage('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage('Please check your email to confirm your account', 'info');
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            showMessage('Signed in successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Auth error:', error);
        
        // Handle specific error messages
        let errorMessage = 'An error occurred. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
        } else if (error.message.includes('User already registered')) {
            errorMessage = 'This email is already registered. Please sign in.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email before signing in';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    }
}

// Toggle between sign in and sign up
function toggleAuthMode() {
    isSignUp = !isSignUp;
    
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const submitText = document.getElementById('submitText');
    const toggleText = document.getElementById('toggleText');
    const toggleModeBtn = document.getElementById('toggleMode');
    const authMessage = document.getElementById('authMessage');

    // Hide any messages
    authMessage.style.display = 'none';

    if (isSignUp) {
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Start tracking your investments';
        submitText.textContent = 'Sign Up';
        toggleText.textContent = 'Already have an account?';
        toggleModeBtn.textContent = 'Sign In';
    } else {
        authTitle.textContent = 'Sign In';
        authSubtitle.textContent = 'Welcome back! Sign in to continue';
        submitText.textContent = 'Sign In';
        toggleText.textContent = "Don't have an account?";
        toggleModeBtn.textContent = 'Sign Up';
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const icon = passwordToggle.querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.style.display = 'block';

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
