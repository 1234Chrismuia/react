import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";

const BASE_URL = `${import.meta.env.VITE_WP_API_URL}/wp/v2`;

function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError(null);

      try {
        // Get post by slug
        const postRes = await fetch(`${BASE_URL}/posts?slug=${slug}&_embed`);
        const postData = await postRes.json();
        const postItem = postData[0];

        if (!postItem) {
          throw new Error("Post not found");
        }

        setPost(postItem);

        // Get author info
        const authorRes = await fetch(`${BASE_URL}/users/${postItem.author}`);
        const authorData = await authorRes.json();
        setAuthor(authorData);

        // Related posts (same category)
        const categoryId = postItem.categories[0]; 
        if (categoryId) {
          const relatedRes = await fetch(
            `${BASE_URL}/posts?categories=${categoryId}&exclude=${postItem.id}&per_page=3&_embed`
          );
          const relatedData = await relatedRes.json();
          setRelatedPosts(relatedData);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="content-container">
        <div className="error-state">
          <h2>Error Loading Post</h2>
          <p>{error}</p>
          <Link to="/" className="button button-primary">Go Home</Link>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="content-container">
        <div className="empty-state">
          <h3>Post Not Found</h3>
          <p>The post you're looking for doesn't exist.</p>
          <Link to="/" className="button button-primary">Browse Posts</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <article className="single-post">
        {/* Post Header */}
        <header className="post-header mb-4">
          {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
            <div className="post-featured-image mb-4">
              <img
                src={post._embedded["wp:featuredmedia"][0].source_url}
                alt={post.title.rendered}
                className="post-image"
              />
            </div>
          )}
          
          <h1 className="post-title">{post.title.rendered}</h1>
          
          <div className="post-meta">
            {author && (
              <div className="author-info flex items-center gap-2">
                {author.avatar_urls && (
                  <img
                    src={author.avatar_urls["48"]}
                    alt={author.name}
                    className="author-avatar"
                  />
                )}
                <div>
                  <span className="author-name font-medium">By {author.name}</span>
                  {author.description && (
                    <p className="author-bio text-sm text-gray-600">{author.description}</p>
                  )}
                </div>
              </div>
            )}
            <div className="post-date text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* Post Content */}
        <div className="post-content">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </div>

        {/* Post Categories/Tags */}
        <footer className="post-footer mt-8 pt-6 border-t border-gray-200">
          <div className="post-tags flex flex-wrap gap-2">
            {post._embedded?.["wp:term"]?.[1]?.map(tag => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="tag-pill"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </footer>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-posts mt-12">
          <h2 className="section-title mb-6">Related Posts</h2>
          <div className="posts-container">
            <div className="grid">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} hover={true} className="post-card h-full">
                  {relatedPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                    <div className="card-image">
                      <img
                        src={relatedPost._embedded["wp:featuredmedia"][0].source_url}
                        alt={relatedPost.title.rendered}
                      />
                      <div className="image-overlay"></div>
                    </div>
                  )}
                  <div className="card-content">
                    <Link 
                      to={`/post/${relatedPost.slug}`}
                      className="card-title-link"
                    >
                      <h3 className="card-title">{relatedPost.title.rendered}</h3>
                    </Link>
                    <div 
                      className="card-excerpt"
                      dangerouslySetInnerHTML={{ __html: relatedPost.excerpt.rendered }}
                    />
                    <div className="card-footer">
                      <Link 
                        to={`/post/${relatedPost.slug}`}
                        className="read-more-link"
                      >
                        Read More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default PostPage;