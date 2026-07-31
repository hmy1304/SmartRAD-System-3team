import { getAuthToken } from './currentUser';

export const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return {
        'Content-Type': 'application/json'
    };
};
