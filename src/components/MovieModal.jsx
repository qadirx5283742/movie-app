import React, { useEffect } from "react";

const MovieModal = ({ movie, onClose }) => {
  const getSafeHomepageUrl = (homepage) => {
    if (!homepage || typeof homepage !== 'string') return null;

    try {
      const parsedUrl = new URL(homepage);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
        ? parsedUrl.toString()
        : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!movie) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [movie]);

  if (!movie) return null;

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const safeHomepageUrl = getSafeHomepageUrl(movie.homepage);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-[#0f0d23] text-white max-w-7xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <div className="custom-scrollbar max-h-[calc(95vh-1rem)] overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
            <div className="p-4 sm:p-6 md:p-12 md:pt-6 space-y-3 sm:space-y-4">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-start">{movie.title}</h1>
                <div className="flex items-center gap-3 text-gray-400 text-sm md:text-base">
                  <span>{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                  <span>•</span>
                  <span>{movie.adult === 'true' ? 'PG-18+' : 'PG-13'}</span>
                  <span>•</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Rating Badge */}
                <div className="hidden md:flex items-center gap-2 bg-[#1a1625] border border-gray-800 px-4 py-2 rounded-lg">
                  <img src="star.svg" alt="Star" className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-white">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                  <span className="text-gray-500">/10 ({movie.vote_count ? (movie.vote_count / 1000).toFixed(1) + 'K' : '0'})</span>
                </div>

                {/* Popularity Badge */}
                <div className="hidden md:flex items-center gap-2 bg-[#1a1625] border border-gray-800 px-2 py-2 rounded-lg">
                  <img src="popularity.svg" alt="Popularity" className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500">{movie.popularity ? movie.popularity.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 sm:gap-5">
            {/* Poster */}
            <div className="w-full">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : "/no-movie.png"}
                alt={movie.title}
                className="w-full h-full rounded-xl shadow-lg object-cover aspect-[3/2]"
              />
            </div>

            {/* Backdrop / Trailer Area */}
            <div className="relative w-full h-full min-h-[300px] md:min-h-0">
              <img
                src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original/${movie.backdrop_path}` : (movie.poster_path ? `https://image.tmdb.org/t/p/original/${movie.poster_path}` : "/no-movie.png")}
                alt="Backdrop"
                className="w-full h-full object-cover rounded-xl shadow-lg brightness-75"
              />
              <div className="absolute inset-0 flex justify-center items-center">
                <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white px-6 py-3 rounded-full font-medium flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-1"></div>
                  </div>
                  <span>Watch Trailer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-16">
              <div className="text-gray-400 text-sm">Genres</div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {movie.genres && movie.genres.map((genre) => (
                  <span key={genre.id} className="bg-[#1a1625] border border-gray-700 px-4 py-2 rounded-lg text-gray-300 text-sm font-medium">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
            {/* Homepage Button */}
            {safeHomepageUrl && (
              <a href={safeHomepageUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto md:self-auto self-start">
                <button className="w-full bg-[#D6C7FF] hover:bg-[#bca4ff] text-[#1a1228] font-bold py-2 px-6 rounded-xl text-base flex items-center justify-center gap-2 transition-colors">
                  Visit Homepage
                  <span className="text-xl">→</span>
                </button>
              </a>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-16">
            <div className="text-gray-400 text-sm shrink-0">Overview</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {movie.overview}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-10">
            <div className="text-gray-400 text-sm shrink-0">Release Date</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {formatDate(movie.release_date)}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-15">
            <div className="text-gray-400 text-sm shrink-0">Countries</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {movie.production_countries?.map(c => c.name).join(', ')}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-21">
            <div className="text-gray-400 text-sm shrink-0">Status</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {movie.status || 'N/A'}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-16">
            <div className="text-gray-400 text-sm shrink-0">Language</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {movie.spoken_languages?.map(l => l.english_name).join(', ') || movie.original_language}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-20">
            <div className="text-gray-400 text-sm shrink-0">Budget</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {formatCurrency(movie.budget)}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-18">
            <div className="text-gray-400 text-sm shrink-0">Revenue</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {formatCurrency(movie.revenue)}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-14">
            <div className="text-gray-400 text-sm shrink-0">Production<br />Companies</div>
            <div className="flex flex-wrap gap-2 w-full md:w-[60%] font-light text-sm/6">
              {movie.production_companies?.map(c => c.name).join(', ') || 'N/A'}
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
