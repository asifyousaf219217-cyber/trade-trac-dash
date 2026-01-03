// Shared authentication module for all pages
import { supabase } from './src/integrations/supabase/client.ts';

// Initialize auth on page load
export function initSharedAuth() {
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session);
        if (session) {
            // Defer profile fetch to avoid deadlock
            setTimeout(() => {
                loadUserProfile(session.user);
            }, 0);
        }
    });

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session);
        if (session) {
            loadUserProfile(session.user);
        }
    });

    // Initialize profile dropdown
    initProfileDropdown();

    // Initialize theme
    initTheme();
}

// Load user profile data
async function loadUserProfile(user) {
    if (!user) return;

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle();

        const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
        const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

        // Update nav dropdown
        const menuName = document.getElementById('menuName');
        const menuEmail = document.getElementById('menuEmail');
        const navAvatar = document.getElementById('navAvatar');
        const menuAvatar = document.getElementById('menuAvatar');

        if (menuName) menuName.textContent = displayName;
        if (menuEmail) menuEmail.textContent = user?.email || '';

        // Update avatars
        [navAvatar, menuAvatar].forEach(el => {
            if (!el) return;
            if (avatarUrl) {
                el.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            } else {
                const initial = displayName.charAt(0).toUpperCase();
                el.innerHTML = `<span class="avatar-initial">${initial}</span>`;
            }
        });
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Update auth UI based on session
function updateAuthUI(session) {
    const loginBtn = document.getElementById('loginBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (session) {
        // User is logged in - show profile dropdown
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileDropdown) profileDropdown.style.display = 'block';
    } else {
        // User is not logged in - show login button
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (profileDropdown) profileDropdown.style.display = 'none';
    }
}

// Initialize profile dropdown
function initProfileDropdown() {
    const profileTrigger = document.getElementById('profileTrigger');
    const profileMenu = document.getElementById('profileMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    // Profile dropdown toggle
    if (profileTrigger && profileMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
            profileTrigger.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
                profileTrigger.classList.remove('active');
            }
        });
    }

    // Logout button handler
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

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initSharedAuth();
});
