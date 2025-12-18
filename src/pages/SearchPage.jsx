import { useState } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link } from "react-router-dom";

const SEARCH_API = `${import.meta.env.VITE_WP_API_URL || 'https://educationnewshub.co.ke/wp-json'}/wp/v2/search?search=`;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(SEARCH_API + encodeURIComponent(query.trim()));
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Search Posts</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search..."
          style={{ marginRight: "8px", width: "240px" }}
        />
        <Button type="submit">Search</Button>
      </form>

      {loading && <Loader />}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      {(!loading && !error && results.length === 0 && query) && (
        <div>No results found.</div>
      )}

      <div className="posts-container">
        <div className="search-results">
          {results.map(item => (
            <Card key={item.id} className="post-card">
              <Link to={`/post/${item.slug}`}>
                <h2>{item.title}</h2>
              </Link>
              {item.url && (
                <div>
                  <small>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.url}
                    </a>
                  </small>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;