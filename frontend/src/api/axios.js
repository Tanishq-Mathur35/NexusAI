import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    try {
        const storedAuth = JSON.parse(
            localStorage.getItem('auth-storage')
        );

        if (storedAuth?.state?.accessToken) {
            config.headers.Authorization = `Bearer ${storedAuth.state.accessToken}`;
        }
    } catch {
        // Ignore localStorage parsing errors
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const storedAuth = JSON.parse(
                    localStorage.getItem('auth-storage')
                );

                if (storedAuth?.state?.refreshToken) {
                    const { data } = await axios.post(
                        '/api/auth/refresh',
                        {
                            refreshToken: storedAuth.state.refreshToken,
                        }
                    );

                    storedAuth.state.accessToken = data.accessToken;
                    storedAuth.state.refreshToken = data.refreshToken;

                    localStorage.setItem(
                        'auth-storage',
                        JSON.stringify(storedAuth)
                    );

                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);


export default api;
