// ============================================
// SHARED-AUTH.JS - Authentication for all pages
// This file handles login state across the whole site
// ============================================

// importing supabase for auth
import { supabase } from './src/integrations/supabase/client.ts';

// ============================================
// MAIN FUNCTION - sets up auth on any page
// ============================================
export function initSharedAuth() {
    // listening for login/logout events
    // this runs whenever user signs in or out
    supabase.auth.onAuthStateChange((event, session) => {
        // updating the ui based on login status
        updateAuthUI(session);
        
        if (session) {
            // user is logged in - load their profile info
            // using setTimeout to avoid blocking issues
            setTimeout(() => {
                loadUserProfile(session.user);
            }, 0);
        }
    });

    // checking if user is already logged in when page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session);
        if (session) {
            loadUserProfile(session.user);
        }
    });

    // setting up the profile dropdown menu
    initProfileDropdown();

    // setting up dark/light mode
    initTheme();
}

// ============================================
// LOAD USER PROFILE - gets name and avatar from database
// ============================================
async function loadUserProfile(user) {
    if (!user) return;

    try {
        // fetching profile from supabase
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();

        // figuring out what name to display
        // checking profile first, then google info, then email
        const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

        // getting the nav elements
        const menuName = document.getElementById('menuName');
        const menuEmail = document.getElementById('menuEmail');
        const navAvatar = document.getElementById('navAvatar');
        const menuAvatar = document.getElementById('menuAvatar');

        // updating the name and email
        if (menuName) menuName.textContent = displayName;
        if (menuEmail) menuEmail.textContent = user?.email || '';

        // updating avatar images
        [navAvatar, menuAvatar].forEach(el => {
            if (!el) return;
            if (avatarUrl) {
                // show profile picture
                el.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            } else {
                // show first initial
                const initial = displayName.charAt(0).toUpperCase();
                el.innerHTML = `<span class="avatar-initial">${initial}</span>`;
            }
        });
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ============================================
// UPDATE AUTH UI - shows/hides login button and profile
// ============================================
function updateAuthUI(session) {
    const loginBtn = document.getElementById('loginBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (session) {
        // user IS logged in
        // hide login button, show profile dropdown
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'block';
    } else {
        // user is NOT logged in
        // show login button, hide profile dropdown
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

// ============================================
// PROFILE DROPDOWN - the menu when clicking avatar
// ============================================
function initProfileDropdown() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // toggle menu open/closed when clicking avatar
    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
            profileTrigger.classList.toggle('active');
        });

        // close menu when clicking anywhere else on page
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
                profileTrigger.classList.remove('active');
            }
        });
    }

    // logout button - signs out and goes to home page
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
}

// ============================================
// THEME - dark/light mode toggle
// ============================================
function initTheme() {
    // checking saved preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // applying the saved theme
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // setting up the toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// switches between light and dark mode
function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    // applying new theme
    if (newTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // saving preference
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// updates the icon (moon or sun)
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            // moon for light mode (click to go dark)
            // sun for dark mode (click to go light)
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// ============================================
// AUTO-INIT - runs when any page loads
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initSharedAuth();
});
