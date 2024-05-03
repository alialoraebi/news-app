import React, { useState, useEffect } from 'react';

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const languages = ['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'se', 'ud', 'zh'];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
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

  useEffect(() => {
    const fetchNews = async () => {
      let url = 'https://newsapi.org/v2/';
      const params = new URLSearchParams({
        apiKey: process.env.REACT_APP_API_KEY
      });
    
      // If a category is selected, use the 'top-headlines' endpoint
      if (category) {
        url += 'top-headlines';
        params.append('category', category);
        if (language) {
          params.append('language', language);
        }
      } else {
        // If no category is selected, use the 'everything' endpoint
        url += 'everything';
        if (language) {
          params.append('language', language);
        }
        // Default to a general query if no specific search is provided
        if (!debouncedSearch) {
          params.append('q', 'latest'); // A default term to avoid errors
        }
      }
    
      if (debouncedSearch) {
        params.append('q', debouncedSearch);
      }
    
      url += '?' + params.toString();
    
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const json = await response.json();
        const validArticles = json.articles.filter(article => 
          !(article.title && article.title.includes('[Removed]')) && 
          !(article.description && article.description.includes('[Removed]'))
        );
        setArticles(validArticles);
      } catch (error) {
        setError(error);
      }
    };

    if (debouncedSearch || category || language) {
      fetchNews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, language]); // React to changes in debouncedSearch, category, and language

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto py-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for news, topics, or sources"
          className="w-full p-4 text-lg border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex space-x-4 my-4">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="flex-1 p-4 text-lg border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="flex-1 p-4 text-lg border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select language</option>
            {languages.map((lang, index) => (
              <option key={index} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        {articles.length ? (
          <div className="space-y-4">
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
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">No articles found. Try adjusting your filters or refresh.</p>
        )}
      </div>
    </div>
  );
  
};

export default HomeScreen;