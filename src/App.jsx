import { useState, useEffect } from 'react'
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';
import MovieModal from './components/MovieModal';


const API_BASE_URL = '/api';
const isProductionNetlify = import.meta.env.PROD;

const getMoviesUrl = (query = '', pageNumber = 1) => {
    const basePath = isProductionNetlify ? '/.netlify/functions' : API_BASE_URL;

    return query
        ? `${basePath}/movies?query=${encodeURIComponent(query)}&page=${pageNumber}`
        : `${basePath}/movies?page=${pageNumber}`;
};

const getMovieDetailsUrl = (movieId) => {
    if (isProductionNetlify) {
        return `/.netlify/functions/movie?id=${movieId}&language=en-US`;
    }

    return `${API_BASE_URL}/movies/${movieId}?language=en-US`;
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceSearhTerm, setDebounceSearhTerm] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const debounceTimer = window.setTimeout(() => {
            setPage(1);
            setDebounceSearhTerm(searchTerm);
        }, 500);

        return () => window.clearTimeout(debounceTimer);
    }, [searchTerm])

    const fetchMovies = async (query = '', pageNumber = 1) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = getMoviesUrl(query, pageNumber);
            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();

            if (data.response === 'False') {
                setErrorMessage(data.error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);
            setTotalPages(data.total_pages || 1);

            if (query && data.results.length > 0 && pageNumber === 1) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.log(`Error fetching Movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    const openMovie = async (movie) => {
        try {
            const res = await fetch(getMovieDetailsUrl(movie.id));
            if (!res.ok) throw new Error('Failed to fetch details');
            const details = await res.json();
            setSelectedMovie(details);
        } catch (e) {
            console.error(e);
            // fallback: still show basic card data
            setSelectedMovie(movie);
        }
    };

    useEffect(() => {
        fetchMovies(debounceSearhTerm, page);
    }, [debounceSearhTerm, page]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className='pattern' />
            <div className='wrapper'>
                <header>
                    <img src='./hero.png' alt='Hero Banner' />
                    <h1>Find <span className='text-gradient'>Movies</span> You'll enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className='trending'>
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                <section className='all-movies'>
                    <h2 className='mt-[40px]'>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className='text-white'>{errorMessage}</p>
                    ) : (
                        <>
                            <ul>
                                {movieList.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} onClick={openMovie} />
                                ))}
                            </ul>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8 text-white">
                                    <button
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-[#1a1228] rounded-lg hover:bg-[#2a1f3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm font-medium">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 bg-[#1a1228] rounded-lg hover:bg-[#2a1f3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>

            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
            )}
        </main>
    )
}

export default App
