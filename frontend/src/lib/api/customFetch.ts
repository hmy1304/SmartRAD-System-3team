import { getAuthHeaders } from '../auth/authHeaders';

export const customFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Handle unauthorized
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return response;
};
