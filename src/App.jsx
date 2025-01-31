import { useState, useEffect } from 'react';
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'use-debounce'; 
import { updateSearhCount } from './appwrite.js';

const API_BASE_URL = "https://api.themoviedb.org/3"; 
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; 

const API_OPTIONS = {
  method:'GET', 
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  }
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [debounceSearchTerm] = useDebounce(searchTerm, 500);

  const fetchMovie = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movie');
      }

      const data = await response.json();
      console.log(data);

      if (data.Response === 'false') {
        setErrorMessage(data.Error || 'Failed to fetch movie');
        setMovieList([]);
        return;
      } 
      setMovieList(data.results || []); 

      if(query && data.results.length > 0){
        await updateSearhCount(query, data.results[0]);
      }
    
    } catch (error) {
      console.log(`Error Fetching Movie: ${error}`);
      setErrorMessage('Error fetching movie. Please try again later.');
    } finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie(debounceSearchTerm);
  }, [debounceSearchTerm]);

  return (
    <main className='overflow-x-hidden'>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="hero banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className="all-movies">
            <h2 className='mt-[20px]'>All Movies</h2>

            {isloading ?  (
              <Spinner/>
            ): errorMessage ? (
              <p className='text-red-500'>{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie}/>
                  
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
