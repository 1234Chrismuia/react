import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Loader from "../components/Loader";
import Button from "../components/Button";

const WP_API_URL = `${import.meta.env.VITE_WP_API_URL}/wp/v2/posts?_embed`;

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`${WP_API_URL}&page=${page}&per_page=6`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        setTotalPages(parseInt(res.headers.get("X-WP-TotalPages") || "1"));
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="container text-center">
      <div className="error-state">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="content-container">
      <header className="page-header">
        <h1>Latest Blog Posts</h1>
        <p className="page-subtitle">
          Discover insights, tutorials, and news from our WordPress community
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No posts found</h2>
          <p>There are no published posts at the moment.</p>
        </div>
      ) : (
        <>
          {/* UPDATED SECTION: Replaced Tailwind grid with custom classes */}
          <div className="posts-container">
            <div className="posts-grid">
              {posts.map((post) => (
                <Card key={post.id} hover={true} className="post-card">
                  {/* Featured Image */}
                  {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                    <div className="card-image">
                      <img
                        src={post._embedded["wp:featuredmedia"][0].source_url}
                        alt={post.title.rendered}
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  <div className="card-content">
                    {/* Post Meta */}
                    <div className="post-meta">
                      <span className="meta-item">
                        📅 {formatDate(post.date)}
                      </span>
                      {post._embedded?.author?.[0] && (
                        <span className="meta-item">
                          👤 {post._embedded.author[0].name}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link to={`/post/${post.slug}`} className="card-title-link">
                      <h3 className="card-title">
                        {post.title.rendered}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <div 
                      className="card-excerpt"
                      dangerouslySetInnerHTML={{ 
                        __html: post.excerpt.rendered.substring(0, 150) + '...' 
                      }}
                    />

                    {/* Read More */}
                    <div className="card-footer">
                      <Link 
                        to={`/post/${post.slug}`} 
                        className="read-more-link"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              
              <div className="pagination-info">
                Page <span className="current-page">{page}</span> of {totalPages}
              </div>
              
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;