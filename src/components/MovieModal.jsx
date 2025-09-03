import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const MovieModal = ({ movie, onClose }) => {
    if (!movie) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/70">
  <div className="bg-[#1a1228] text-white max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden relative">
    {/* Close button */}
    <button
      className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
      onClick={onClose}
    >
      ✖
    </button>
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">Squid Game 2</h1>
          <div className="flex items-center gap-2 bg-[#2a1f3d] px-3 py-1 rounded-full">
            <span>8.9/10 (200K)</span>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Poster */}
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : "/no-movie.png"}
                alt="Squid Game Poster"
                className="rounded-xl"
              />
            </CardContent>
          </Card>

          {/* Trailer */}
          <Card className="bg-transparent border-0 shadow-none relative">
            <CardContent className="p-0 relative">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : "/no-movie.png"}
                alt="Trailer Thumbnail"
                className="rounded-xl"
              />
              <div className="absolute inset-0 flex justify-center items-center">
                <button className="bg-white text-black px-4 py-2 rounded-full font-bold">
                  ▶ Trailer · 0:31
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Genres */}
          <div className="flex gap-2">
            <span className="bg-purple-700 px-3 py-1 rounded-lg">Adventure</span>
            <span className="bg-blue-700 px-3 py-1 rounded-lg">Action</span>
            <span className="bg-gray-700 px-3 py-1 rounded-lg">Drama</span>
          </div>

          {/* Overview */}
          <p className="text-gray-300">
            Hundreds of cash-strapped players accept a strange invitation to compete
            in children's games. Inside, a tempting prize awaits with deadly high
            stakes: a survival game that has a whopping 45.6 billion-won prize at
            stake.
          </p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <p>
              <strong>Release date:</strong> December 26, 2024 (Worldwide)
            </p>
            <p>
              <strong>Countries:</strong> United States · Canada · UAE · Hungary · Italy ·
              New Zealand
            </p>
            <p>
              <strong>Status:</strong> Released
            </p>
            <p>
              <strong>Language:</strong> English · Korean · Hindi · Arabic · German · Spanish
            </p>
            <p>
              <strong>Budget:</strong> $21.4 million
            </p>
            <p>
              <strong>Revenue:</strong> $900 Million
            </p>
            <p>
              <strong>Tagline:</strong> 45.6 Billion Won is Child's Play
            </p>
            <p>
              <strong>Production Companies:</strong> Legendary Entertainment · Warner Bros.
              Entertainment · Villeneuve Films
            </p>
          </div>

          {/* Button */}
          <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
            Visit Homepage →
          </Button>
        </div>
      </div>
    </div>
  );
};
export default MovieModal;