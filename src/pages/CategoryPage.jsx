// src/pages/CategoryPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";

const BASE_URL = `${import.meta.env.VITE_WP_API_URL}/wp/v2`;

function CategoryPage() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch categories`);
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error('Categories fetch error:', err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    
    const category = categories.find((cat) => cat.slug === slug);
    setActiveCategory(category);

    if (category) {
      setLoading(true);
      setError(null);
      
      fetch(`${BASE_URL}/posts?categories=${category.id}&_embed&per_page=12`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch posts`);
          return res.json();
        })
        .then((data) => {
          setPosts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Posts fetch error:', err);
          setError(err.message);
          setPosts([]);
          setLoading(false);
        });
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [slug, categories]);

  if (error) {
    return (
      <div className="content-container">
        <div style={{
          padding: '2rem',
          background: 'var(--error-color)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" style={{ color: 'white', textDecoration: 'underline' }}>
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Categories Sidebar */}
        <aside style={{
          width: '250px',
          background: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          height: 'fit-content'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: slug === cat.slug ? 'var(--primary-color)' : 'transparent',
                  color: slug === cat.slug ? 'white' : 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {/* Category Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            marginBottom: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <h1 style={{ marginBottom: '0.5rem' }}>
              {activeCategory ? activeCategory.name : 'Category not found'}
            </h1>
            {activeCategory?.description && (
              <p style={{ opacity: 0.9 }}>
                {activeCategory.description}
              </p>
            )}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>No posts found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                There are no posts in this category yet.
              </p>
            </div>
          ) : (
            <div className="posts-container">
              <div className="category-posts">
                {posts.map((post) => (
                  <Card key={post.id} className="post-card">
                    {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                      <img
                        src={post._embedded["wp:featuredmedia"][0].source_url}
                        alt={post.title.rendered}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
                      />
                    )}
                    <div style={{ padding: '1rem' }}>
                      <Link to={`/post/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{post.title.rendered}</h3>
                      </Link>
                      <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.substring(0, 100) + '...' }} />
                      <Link to={`/post/${post.slug}`} style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary-color)' }}>
                        Read more →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CategoryPage;