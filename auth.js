import { supabase } from './src/integrations/supabase/client.ts';

let isSignUp = false;

// Initialize auth page
function initAuth() {
    // Set up auth state listener for session persistence
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            // User is logged in, redirect to home
            window.location.href = 'index.html';
        }
    });

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    const form = document.getElementById('authForm');
    const toggleModeBtn = document.getElementById('toggleMode');
    const passwordToggle = document.getElementById('passwordToggle');
    const googleSignInBtn = document.getElementById('googleSignIn');

    form.addEventListener('submit', handleAuth);
    toggleModeBtn.addEventListener('click', toggleAuthMode);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    const googleBtn = document.getElementById('googleSignIn');
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/index.html`
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Google sign in error:', error);
        showMessage('Failed to connect with Google. Please try again.', 'error');
        googleBtn.disabled = false;
        googleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
        `;
    }
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
            // First, try to sign in to check if user already exists
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            // If sign in successful, user already exists
            if (signInData.session) {
                showMessage('You are already registered! Signing you in...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            }

            // If user doesn't exist, create new account
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/index.html`,
                    data: {
                        email: email
                    }
                }
            });

            if (error) {
                // Check if error is about user already exists
                if (error.message.includes('already registered') || error.message.includes('already exists')) {
                    showMessage('This email is already registered. Please sign in instead.', 'error');
                    setTimeout(() => {
                        toggleAuthMode();
                    }, 2000);
                    return;
                }
                throw error;
            }

            // Successfully created account
            if (data.session) {
                showMessage('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else if (data.user) {
                // If no session but user exists, try to sign in
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (loginError) throw loginError;

                showMessage('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } else {
            // Sign in flow
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
            errorMessage = 'This email is already registered. Please sign in instead.';
            setTimeout(() => {
                if (isSignUp) toggleAuthMode();
            }, 2000);
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address';
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
