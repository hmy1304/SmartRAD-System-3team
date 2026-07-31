export const getCurrentUser = () => {
    try {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        }
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }
    return null;
};

export const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    
    // Parse cookie
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    
    return localStorage.getItem('token') || null;
};
