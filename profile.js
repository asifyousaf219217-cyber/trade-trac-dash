// ============================================
// PROFILE.JS - Manages user profile page
// Handles loading, editing, and saving user info
// ============================================

// importing supabase for database and auth
import { supabase } from './src/integrations/supabase/client.ts';

// keeping track of current user and their profile data
let currentUser = null;
let currentProfile = null;
let isEditing = false;

// ============================================
// MAIN FUNCTION - starts everything up
// ============================================
async function initProfile() {
    // listening for auth changes - if user logs out, send them to login page
    supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
            // not logged in? go to login page!
            window.location.href = 'auth.html';
            return;
        }
        currentUser = session.user;
        loadProfile();
    });

    // checking if user is currently logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // no session means not logged in
        window.location.href = 'auth.html';
        return;
    }
    
    // saving the current user
    currentUser = session.user;
    
    // loading their profile from database
    await loadProfile();
    
    // setting up all the ui stuff
    initTabs();
    initTheme();
    initProfileDropdown();
    initFormHandlers();
}

// ============================================
// LOAD PROFILE - gets user data from database
// ============================================
async function loadProfile() {
    if (!currentUser) return;

    try {
        // fetching profile from supabase profiles table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (error) throw error;

        // saving profile and updating the page
        currentProfile = profile;
        updateUIWithProfile(profile);
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// ============================================
// UPDATE UI - fills in all the form fields
// ============================================
function updateUIWithProfile(profile) {
    // figuring out what name to show
    // priority: profile name > google name > email username > "User"
    const displayName = profile?.display_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
    const avatarUrl = profile?.avatar_url || currentUser?.user_metadata?.avatar_url;

    // updating the header section
    document.getElementById('profileName').textContent = displayName;
    document.getElementById('profileEmail').textContent = email;

    // updating the nav dropdown
    document.getElementById('menuName').textContent = displayName;
    document.getElementById('menuEmail').textContent = email;

    // updating all avatar images
    updateAvatars(avatarUrl, displayName);

    // filling in the form fields
    document.getElementById('displayName').value = displayName;
    document.getElementById('emailField').value = email;
    document.getElementById('phone').value = profile?.phone || '';
    document.getElementById('timezone').value = profile?.timezone || 'UTC';
    document.getElementById('bio').value = profile?.bio || '';
    document.getElementById('currency').value = profile?.preferred_currency || 'USD';

    // setting notification checkboxes
    document.getElementById('emailPriceAlerts').checked = profile?.notification_email !== false;
    document.getElementById('emailDigest').checked = profile?.notification_email !== false;

    // if user signed in with google, show connected status
    const provider = currentUser?.app_metadata?.provider;
    if (provider === 'google') {
        document.getElementById('googleStatus').textContent = 'Connected';
        document.getElementById('connectGoogleBtn').textContent = 'Connected';
        document.getElementById('connectGoogleBtn').disabled = true;
        document.getElementById('connectGoogleBtn').classList.add('connected');
    }

    // syncing dark mode toggle with current theme
    const isDark = document.body.classList.contains('dark');
    document.getElementById('darkModeToggle').checked = isDark;
}

// ============================================
// UPDATE AVATARS - shows profile picture or initials
// ============================================
function updateAvatars(avatarUrl, displayName) {
    // all the places we show the avatar
    const avatarElements = [
        document.getElementById('navAvatar'),
        document.getElementById('menuAvatar'),
        document.getElementById('profileAvatar')
    ];

    avatarElements.forEach(el => {
        if (!el) return;
        
        if (avatarUrl) {
            // they have a profile picture - show it
            el.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            // add camera button on main profile avatar
            if (el.id === 'profileAvatar') {
                el.innerHTML += `<button class="avatar-edit-btn" id="avatarEditBtn"><i class="fas fa-camera"></i></button>`;
            }
        } else {
            // no picture - show their first initial
            const initial = displayName.charAt(0).toUpperCase();
            el.innerHTML = `<span class="avatar-initial">${initial}</span>`;
            if (el.id === 'profileAvatar') {
                el.innerHTML += `<button class="avatar-edit-btn" id="avatarEditBtn"><i class="fas fa-camera"></i></button>`;
            }
        }
    });
}

// ============================================
// TABS - switching between different sections
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // removing active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            
            // adding active to clicked tab
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// ============================================
// THEME - dark/light mode handling
// ============================================
function initTheme() {
    // checking what theme they had saved
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    // setting up the theme toggle button in navbar
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }

    // syncing with the toggle in preferences
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
        darkModeToggle.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            if (newTheme === 'dark') {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

// switches theme when navbar button is clicked
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
    
    // keeping the preferences toggle in sync
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = newTheme === 'dark';
    }
}

// updates the icon (moon for light mode, sun for dark)
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// ============================================
// PROFILE DROPDOWN - the menu when you click your avatar
// ============================================
function initProfileDropdown() {
    const trigger = document.getElementById('profileTrigger');
    const menu = document.getElementById('profileMenu');
    const loginBtn = document.getElementById('loginBtn');
    const dropdown = document.getElementById('profileDropdown');

    // showing dropdown and hiding login button (we're logged in!)
    if (dropdown) dropdown.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';

    if (trigger && menu) {
        // toggle menu when clicking avatar
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            trigger.classList.toggle('active');
        });

        // close menu when clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                trigger.classList.remove('active');
            }
        });
    }

    // logout button - signs user out and sends to home
    const logoutBtn = document.getElementById('logoutBtn');
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
// FORM HANDLERS - edit/save/cancel buttons
// ============================================
function initFormHandlers() {
    // getting all the form elements
    const editBtn = document.getElementById('editPersonalBtn');
    const cancelBtn = document.getElementById('cancelPersonalBtn');
    const formActions = document.getElementById('personalFormActions');
    const personalForm = document.getElementById('personalForm');
    const inputs = personalForm.querySelectorAll('input:not([type="email"]), textarea, select');

    // edit button - enables all the input fields
    editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        inputs.forEach(input => input.disabled = !isEditing);
        formActions.style.display = isEditing ? 'flex' : 'none';
        editBtn.innerHTML = isEditing ? '<i class="fas fa-times"></i> Cancel' : '<i class="fas fa-edit"></i> Edit';
    });

    // cancel button - disables fields and resets values
    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        inputs.forEach(input => input.disabled = true);
        formActions.style.display = 'none';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        // putting back original values
        updateUIWithProfile(currentProfile);
    });

    // personal info form submission
    personalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePersonalInfo();
    });

    // preferences form submission
    const preferencesForm = document.getElementById('preferencesForm');
    preferencesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePreferences();
    });

    // notifications form submission
    const notificationsForm = document.getElementById('notificationsForm');
    notificationsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNotifications();
    });

    // security buttons (these are just placeholders for now)
    document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
        showToast('Password reset email sent!', 'success');
    });

    document.getElementById('enable2faBtn')?.addEventListener('click', () => {
        showToast('2FA setup coming soon!', 'info');
    });

    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            showToast('Account deletion is disabled for demo', 'error');
        }
    });
}

// ============================================
// SAVE PERSONAL INFO - updates profile in database
// ============================================
async function savePersonalInfo() {
    if (!currentUser) return;

    // getting all the values from the form
    const displayName = document.getElementById('displayName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const timezone = document.getElementById('timezone').value;
    const bio = document.getElementById('bio').value.trim();

    // name is required!
    if (!displayName) {
        showToast('Display name is required', 'error');
        return;
    }

    try {
        // updating the profile in supabase
        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: displayName,
                phone: phone || null,
                timezone: timezone,
                bio: bio || null,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // updating our local copy
        currentProfile = { ...currentProfile, display_name: displayName, phone, timezone, bio };
        
        // turning off edit mode
        isEditing = false;
        const inputs = document.getElementById('personalForm').querySelectorAll('input:not([type="email"]), textarea, select');
        inputs.forEach(input => input.disabled = true);
        document.getElementById('personalFormActions').style.display = 'none';
        document.getElementById('editPersonalBtn').innerHTML = '<i class="fas fa-edit"></i> Edit';
        
        // updating the name shown on page
        document.getElementById('profileName').textContent = displayName;
        document.getElementById('menuName').textContent = displayName;
        
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Failed to save changes', 'error');
    }
}

// ============================================
// SAVE PREFERENCES - updates trading preferences
// ============================================
async function savePreferences() {
    if (!currentUser) return;

    const currency = document.getElementById('currency').value;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                preferred_currency: currency,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

        if (error) throw error;

        showToast('Preferences saved!', 'success');
    } catch (error) {
        console.error('Error saving preferences:', error);
        showToast('Failed to save preferences', 'error');
    }
}

// ============================================
// SAVE NOTIFICATIONS - updates notification settings
// ============================================
async function saveNotifications() {
    if (!currentUser) return;

    const emailEnabled = document.getElementById('emailPriceAlerts').checked;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                notification_email: emailEnabled,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

        if (error) throw error;

        showToast('Notification settings saved!', 'success');
    } catch (error) {
        console.error('Error saving notifications:', error);
        showToast('Failed to save notification settings', 'error');
    }
}

// ============================================
// TOAST - shows little popup messages
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    // setting the message
    toastMessage.textContent = message;
    toast.className = `toast toast-${type}`;
    
    // picking the right icon
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    // showing the toast
    toast.classList.add('show');
    
    // hiding it after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// START EVERYTHING - runs when page loads
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
