import { supabase } from './src/integrations/supabase/client.ts';

let currentUser = null;
let currentProfile = null;
let isEditing = false;

// Initialize profile page
async function initProfile() {
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (!session) {
            // Not logged in, redirect to auth page
            window.location.href = 'auth.html';
            return;
        }
        currentUser = session.user;
        loadProfile();
    });

    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }
    
    currentUser = session.user;
    await loadProfile();
    
    initTabs();
    initTheme();
    initProfileDropdown();
    initFormHandlers();
}

// Load user profile from database
async function loadProfile() {
    if (!currentUser) return;

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

        if (error) throw error;

        currentProfile = profile;
        updateUIWithProfile(profile);
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// Update UI with profile data
function updateUIWithProfile(profile) {
    const displayName = profile?.display_name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';
    const email = currentUser?.email || '';
    const avatarUrl = profile?.avatar_url || currentUser?.user_metadata?.avatar_url;

    // Update page header
    document.getElementById('profileName').textContent = displayName;
    document.getElementById('profileEmail').textContent = email;

    // Update nav dropdown
    document.getElementById('menuName').textContent = displayName;
    document.getElementById('menuEmail').textContent = email;

    // Update avatars
    updateAvatars(avatarUrl, displayName);

    // Update form fields
    document.getElementById('displayName').value = displayName;
    document.getElementById('emailField').value = email;
    document.getElementById('phone').value = profile?.phone || '';
    document.getElementById('timezone').value = profile?.timezone || 'UTC';
    document.getElementById('bio').value = profile?.bio || '';
    document.getElementById('currency').value = profile?.preferred_currency || 'USD';

    // Update notification settings
    document.getElementById('emailPriceAlerts').checked = profile?.notification_email !== false;
    document.getElementById('emailDigest').checked = profile?.notification_email !== false;

    // Check if user signed in with Google
    const provider = currentUser?.app_metadata?.provider;
    if (provider === 'google') {
        document.getElementById('googleStatus').textContent = 'Connected';
        document.getElementById('connectGoogleBtn').textContent = 'Connected';
        document.getElementById('connectGoogleBtn').disabled = true;
        document.getElementById('connectGoogleBtn').classList.add('connected');
    }

    // Update dark mode toggle based on current theme
    const isDark = document.body.classList.contains('dark');
    document.getElementById('darkModeToggle').checked = isDark;
}

// Update all avatar elements
function updateAvatars(avatarUrl, displayName) {
    const avatarElements = [
        document.getElementById('navAvatar'),
        document.getElementById('menuAvatar'),
        document.getElementById('profileAvatar')
    ];

    avatarElements.forEach(el => {
        if (!el) return;
        
        if (avatarUrl) {
            el.innerHTML = `<img src="${avatarUrl}" alt="${displayName}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            if (el.id === 'profileAvatar') {
                el.innerHTML += `<button class="avatar-edit-btn" id="avatarEditBtn"><i class="fas fa-camera"></i></button>`;
            }
        } else {
            const initial = displayName.charAt(0).toUpperCase();
            el.innerHTML = `<span class="avatar-initial">${initial}</span>`;
            if (el.id === 'profileAvatar') {
                el.innerHTML += `<button class="avatar-edit-btn" id="avatarEditBtn"><i class="fas fa-camera"></i></button>`;
            }
        }
    });
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeIcon(savedTheme);
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Sync dark mode toggle in preferences
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
    
    // Sync with preferences toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = newTheme === 'dark';
    }
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

// Initialize profile dropdown
function initProfileDropdown() {
    const trigger = document.getElementById('profileTrigger');
    const menu = document.getElementById('profileMenu');
    const loginBtn = document.getElementById('loginBtn');
    const dropdown = document.getElementById('profileDropdown');

    // Show dropdown, hide login button
    if (dropdown) dropdown.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';

    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            trigger.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                trigger.classList.remove('active');
            }
        });
    }

    // Logout handler
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

// Initialize form handlers
function initFormHandlers() {
    // Edit personal info button
    const editBtn = document.getElementById('editPersonalBtn');
    const cancelBtn = document.getElementById('cancelPersonalBtn');
    const formActions = document.getElementById('personalFormActions');
    const personalForm = document.getElementById('personalForm');
    const inputs = personalForm.querySelectorAll('input:not([type="email"]), textarea, select');

    editBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        inputs.forEach(input => input.disabled = !isEditing);
        formActions.style.display = isEditing ? 'flex' : 'none';
        editBtn.innerHTML = isEditing ? '<i class="fas fa-times"></i> Cancel' : '<i class="fas fa-edit"></i> Edit';
    });

    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        inputs.forEach(input => input.disabled = true);
        formActions.style.display = 'none';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        // Reset form values
        updateUIWithProfile(currentProfile);
    });

    // Personal form submit
    personalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePersonalInfo();
    });

    // Preferences form submit
    const preferencesForm = document.getElementById('preferencesForm');
    preferencesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePreferences();
    });

    // Notifications form submit
    const notificationsForm = document.getElementById('notificationsForm');
    notificationsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNotifications();
    });

    // Security actions
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

// Save personal info
async function savePersonalInfo() {
    if (!currentUser) return;

    const displayName = document.getElementById('displayName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const timezone = document.getElementById('timezone').value;
    const bio = document.getElementById('bio').value.trim();

    // Validation
    if (!displayName) {
        showToast('Display name is required', 'error');
        return;
    }

    try {
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

        // Update local state
        currentProfile = { ...currentProfile, display_name: displayName, phone, timezone, bio };
        
        // Exit edit mode
        isEditing = false;
        const inputs = document.getElementById('personalForm').querySelectorAll('input:not([type="email"]), textarea, select');
        inputs.forEach(input => input.disabled = true);
        document.getElementById('personalFormActions').style.display = 'none';
        document.getElementById('editPersonalBtn').innerHTML = '<i class="fas fa-edit"></i> Edit';
        
        // Update UI
        document.getElementById('profileName').textContent = displayName;
        document.getElementById('menuName').textContent = displayName;
        
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Failed to save changes', 'error');
    }
}

// Save preferences
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

// Save notifications
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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = `toast toast-${type}`;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else {
        icon.className = 'fas fa-info-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
