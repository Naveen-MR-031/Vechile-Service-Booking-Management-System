import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for data fetching with loading and error states
 * @param {string} url - API endpoint
 * @param {object} options - { immediate: boolean, deps: array }
 */
export const useFetch = (url, options = {}) => {
    const { immediate = true, deps = [] } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(url);
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [immediate, fetchData, ...deps]);

    const refetch = () => fetchData();

    return { data, loading, error, refetch };
};

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 * @param {function} apiFunction - API function to call
 */
export const useMutation = (apiFunction) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const mutate = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFunction(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setData(null);
        setError(null);
    };

    return { mutate, loading, error, data, reset };
};

export default useFetch;
