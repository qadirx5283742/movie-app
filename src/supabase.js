const normalizeSearchTerm = (searchTerm) => {
    if (typeof searchTerm !== 'string') return '';

    return searchTerm
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .slice(0, 80);
};

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

        if (!normalizedSearchTerm || !movie?.id) {
            return;
        }

        const response = await fetch('/api/search-metrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchTerm: normalizedSearchTerm,
                movie,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to save search metric.');
        }
    } catch (error) {
        console.error('Supabase search tracking failed:', error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const response = await fetch('/api/trending');

        if (!response.ok) {
            throw new Error('Failed to fetch trending movies.');
        }

        return await response.json();
    } catch (error) {
        console.error('Supabase trending fetch failed:', error);
        return [];
    }
};
