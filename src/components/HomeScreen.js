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
      let params = `apiKey=${process.env.REACT_APP_API_KEY}&q=${search}`;
  
      if (category && !language) {
        url += 'top-headlines';
        params += `&category=${category}`;
      } else {
        url += 'everything';
        if (language) {
          params += `&language=${language}`;
        }
      }
  
      try {
        const response = await fetch(`${url}?${params}`);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('You have reached the maximum number of requests. Please try again later.');
          } else {
            throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
          }
        }
        let json = await response.json();
        if (category && language) {
          json.articles = json.articles.filter(article => article.source.category === category);
        }
        setArticles(json.articles);
      } catch (error) {
        setError(error);
      }
    };
  
    if (search) { 
      fetchNews();
    }
  }, [search, category, language]); 
  
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
      {articles.map((article, index) => (
        <div key={index}>
          <h2>{article.title}</h2>
          <img src={article.urlToImage} alt={article.title} />
          <p>{article.description}</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">Read full article</a>
        </div>
      ))}
    </div>
  );
};

export default HomeScreen;
