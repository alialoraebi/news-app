import React, { useState, useEffect } from 'react';
import { FlagIcon } from 'react-flag-kit';
import Select from 'react-select';

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'].map(category => category.charAt(0).toUpperCase() + category.slice(1));

const languages = {
  'ar': 'Arabic',
  'de': 'German',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'it': 'Italian',
  'nl': 'Dutch',
  'no': 'Norwegian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'se': 'Swedish',
  'zh': 'Chinese'
};

const languageToFlag = {
  'ar': 'SA',
  'de': 'DE',
  'en': 'GB',
  'es': 'ES',
  'fr': 'FR',
  'it': 'IT',
  'nl': 'NL',
  'no': 'NO',
  'pt': 'PT',
  'ru': 'RU',
  'se': 'SE',
  'zh': 'CN'
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const HomeScreen = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('en');
  const debouncedSearch = useDebounce(search, 500); 
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      let url = 'https://newsapi.org/v2/';
      const params = new URLSearchParams({
        apiKey: process.env.REACT_APP_API_KEY,
        pageSize: 10,
        page: page
      });
  
      if (category) {
        url += 'top-headlines';
        params.append('category', category);
        params.append('language', language);
      } else {
        url += 'everything';
        params.append('language', language);
        params.append('q', debouncedSearch || 'latest'); 
      }
  
      url += '?' + params.toString();
  
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const json = await response.json();
        if (json.status !== "ok") {
          throw new Error(`API response not ok: ${json.message}`);
        }
        setArticles(json.articles.filter(article => 
          !(article.title && article.title.includes('[Removed]')) && 
          !(article.description && article.description.includes('[Removed]'))
        ));
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setError(error.toString());
      }
    };
  
    fetchNews();
  }, [debouncedSearch, category, language, page]);

  if (error) return <div>Error: {error.message}</div>;

  const languageOptions = Object.entries(languages).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '58px', 
      borderRadius: '0.375rem', 
      borderWidth: '1px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', 
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none', 
      '&:hover': { borderColor: '#cbd5e1' }
    }),
    option: (styles, { isDisabled, isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isDisabled ? null : isSelected ? '#3b82f6' : isFocused ? '#eff6ff' : null,
      color: isDisabled ? '#ccc' : isSelected ? 'white' : 'black',
      cursor: isDisabled ? 'not-allowed' : 'default',
    }),
  };

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

  const handleNextPage = () => setPage(page + 1);
  const handlePreviousPage = () => setPage(page - 1);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for topics"
            className="flex-grow w-full md:w-3/5 p-4 text-lg border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <Select
            value={categoryOptions.find(option => option.value === category)}
            onChange={option => setCategory(option.value)}
            options={categoryOptions}
            styles={selectStyles}
            className="w-full md:w-1/6"
            classNamePrefix="react-select"
          />
          <Select
            value={languageOptions.find(option => option.value === language)}
            onChange={option => setLanguage(option.value)}
            options={languageOptions}
            styles={selectStyles}
            className="w-full md:w-1/6"
            classNamePrefix="react-select"
            formatOptionLabel={({ value, label }) => (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FlagIcon code={languageToFlag[value] || 'EU'} size={16} />
                <span style={{ marginLeft: '8px' }}>{label}</span>
              </div>
            )}
          />
        </div>
        {articles.length ? (
          <div className="space-y-4 mt-4">
            {articles.map((article, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={article.urlToImage || 'https://via.placeholder.com/400x200'} 
                  alt={article.title || 'Image unavailable'} 
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200'; }}
                />
                <div className="p-4">
                  <h2 className="font-semibold text-xl mb-2">{article.title}</h2>
                  <p className="text-gray-700 text-base mb-4">{article.description || "No description available."}</p>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                    Read More
                  </a>
                </div>
              </div>
            ))}
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={page === 1} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                Previous
              </button>
              <span className="mx-2">Page {page}</span>
              <button onClick={handleNextPage} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg mt-20">No articles found. Try adjusting your filters or refresh.</p>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
