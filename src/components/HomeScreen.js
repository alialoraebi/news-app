import React, { useState, useEffect } from 'react';

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
const languages = ['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'se', 'ud', 'zh'];

const HomeScreen = () => {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      let url = 'https://newsapi.org/v2/';
      const params = new URLSearchParams({
        apiKey: process.env.REACT_APP_API_KEY
      });
  
      // Only add search if it is non-empty
      if (search) {
        params.append('q', search);
      }
  
      // Determine which endpoint and parameters to use
      if (category && !language) {
        url += 'top-headlines';
        params.append('category', category);
      } else if (!category && language) {
        url += 'everything';
        params.append('language', language);
      } else if (category && language) {
        // Since 'top-headlines' does not support 'language', fallback to 'everything'
        url += 'everything';
        params.append('language', language);
        params.append('category', category); // Note: The API does not actually support category here, consider removing
      } else {
        url += 'everything'; // Default to 'everything' if neither are selected
      }
  
      console.log(`Final API Request: ${url}?${params.toString()}`);
  
      try {
        const response = await fetch(`${url}?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        setArticles(jsonData.articles);
      } catch (error) {
        setError(error);
      }
    };
  
    // Trigger fetch
    fetchNews();
  }, [search, category, language]); // Dependencies to trigger re-fetch
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..." />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Select category</option>
        {categories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
      </select>
      <select value={language} onChange={e => setLanguage(e.target.value)}>
        <option value="">Select language</option>
        {languages.map((lang, index) => <option key={index} value={lang}>{lang}</option>)}
      </select>
      {articles.length ? articles.map((article, index) => (
        <div key={index}>
          <h2>{article.title}</h2>
          <img 
            src={article.urlToImage || 'default-image-url'} 
            alt={article.title} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'fallback-image-url'; }}
          />
          <p>{article.description}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">Read More</a>
        </div>
      )) : <p>No articles found. Try adjusting your filters or refresh.</p>}
    </div>
  );
};

export default HomeScreen;
