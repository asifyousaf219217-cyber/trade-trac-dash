// ============================================
// AUTH.JS - Handles user login and signup
// This file manages all the authentication stuff
// ============================================

// importing supabase - this is our database and auth service
import { supabase } from './src/integrations/supabase/client.ts';

// keeping track of whether we're in signup mode or signin mode
let isSignUp = false;

// ============================================
// MAIN FUNCTION - sets up everything when page loads
// ============================================
function initAuth() {
    // this listens for when user logs in or out
    // if they log in, send them to the home page
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            // user just logged in! redirect them home
            window.location.href = 'index.html';
        }
    });

    // checking if user is already logged in when page loads
    // if they are, no need to show login page - just send them home
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    // getting all the form elements we need
    const form = document.getElementById('authForm');
    const toggleModeBtn = document.getElementById('toggleMode');
    const passwordToggle = document.getElementById('passwordToggle');
    const googleSignInBtn = document.getElementById('googleSignIn');

    // setting up click and submit handlers
    form.addEventListener('submit', handleAuth);
    toggleModeBtn.addEventListener('click', toggleAuthMode);
    passwordToggle.addEventListener('click', togglePasswordVisibility);
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
}

// ============================================
// GOOGLE SIGN IN - lets users login with their google account
// ============================================
async function handleGoogleSignIn() {
    // getting the google button so we can disable it while loading
    const googleBtn = document.getElementById('googleSignIn');
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

    try {
        // calling supabase to start google oauth flow
        // this will redirect user to google's login page
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // after google login, come back to our home page
                redirectTo: `${window.location.origin}/index.html`
            }
        });

        // if something went wrong, throw an error
        if (error) throw error;
    } catch (error) {
        // oops! something went wrong with google login
        console.error('Google sign in error:', error);
        showMessage('Failed to connect with Google. Please try again.', 'error');
        
        // resetting the button back to normal
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

// ============================================
// EMAIL/PASSWORD LOGIN - handles the main form submission
// ============================================
async function handleAuth(e) {
    // stopping the form from refreshing the page
    e.preventDefault();

    // getting the values user typed in
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('authSubmit');
    const submitText = document.getElementById('submitText');

    // making sure they filled in both fields
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    // password needs to be at least 6 characters
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    // disabling the button while we process their request
    submitBtn.disabled = true;
    submitText.textContent = isSignUp ? 'Creating account...' : 'Signing in...';

    try {
        if (isSignUp) {
            // ===== SIGNUP FLOW =====
            
            // first, try to sign in to see if user already has an account
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            // if sign in worked, they already have an account!
            if (signInData.session) {
                showMessage('You are already registered! Signing you in...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            }

            // they don't have an account, so let's create one
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // where to send them after email verification
                    emailRedirectTo: `${window.location.origin}/index.html`,
                    data: {
                        email: email
                    }
                }
            });

            // checking for errors
            if (error) {
                // special handling for "already registered" error
                if (error.message.includes('already registered') || error.message.includes('already exists')) {
                    showMessage('This email is already registered. Please sign in instead.', 'error');
                    setTimeout(() => {
                        toggleAuthMode();
                    }, 2000);
                    return;
                }
                throw error;
            }

            // account created! now let's log them in
            if (data.session) {
                showMessage('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else if (data.user) {
                // sometimes supabase creates user but no session
                // so we try to sign them in manually
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
            // ===== SIGNIN FLOW =====
            
            // trying to log the user in with email and password
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // login successful!
            showMessage('Signed in successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        // something went wrong - let's show a helpful error message
        console.error('Auth error:', error);
        
        // figuring out what error message to show
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
        // always reset the button when we're done
        submitBtn.disabled = false;
        submitText.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    }
}

// ============================================
// TOGGLE MODE - switches between signin and signup
// ============================================
function toggleAuthMode() {
    // flipping the mode
    isSignUp = !isSignUp;
    
    // getting all the text elements we need to update
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const submitText = document.getElementById('submitText');
    const toggleText = document.getElementById('toggleText');
    const toggleModeBtn = document.getElementById('toggleMode');
    const authMessage = document.getElementById('authMessage');

    // hiding any old messages
    authMessage.style.display = 'none';

    // updating all the text based on which mode we're in
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

// ============================================
// PASSWORD VISIBILITY - shows/hides password
// ============================================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const icon = passwordToggle.querySelector('i');

    // if password is hidden, show it. if shown, hide it
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

// ============================================
// SHOW MESSAGE - displays feedback to user
// ============================================
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.style.display = 'block';

    // success messages go away after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// ============================================
// START EVERYTHING - runs when page loads
// ============================================
if (document.readyState === 'loading') {
    // page is still loading, wait for it
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    // page already loaded, run now
    initAuth();
}
