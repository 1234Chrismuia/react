import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import Card from "../components/Card";
import Button from "../components/Button";
import PostEditor from "../components/PostEditor";
import Toast from "./Toast";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = `${import.meta.env.VITE_WP_API_URL}/wp/v2`;

function MyPostsPage() {
  const { auth } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    async function fetchMyUser() {
      try {
        const res = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (!res.ok) throw new Error("Failed to get user");
        const user = await res.json();
        setUserId(user.id);
      } catch (err) {
        setError("Failed to get user info");
        setLoading(false);
      }
    }
    fetchMyUser();
  }, [auth, navigate]);

  useEffect(() => {
    if (!userId) return;
    fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/posts?author=${userId}&_embed&per_page=20`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      
      if (res.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        setToastMessage("Post deleted successfully!");
      } else {
        setError("Failed to delete post");
      }
    } catch (err) {
      setError("Error deleting post");
    }
  };

  const handleSave = (savedPost) => {
    if (editingPost) {
      // Update existing post
      setPosts(posts.map(post => 
        post.id === savedPost.id ? savedPost : post
      ));
      setToastMessage("Post updated successfully!");
    } else {
      // Add new post
      setPosts([savedPost, ...posts]);
      setToastMessage("Post created successfully!");
    }
    
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts(); 
  };

  if (loading) return <Loader />;

  return (
    <div className="content-container">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          duration={3000}
          onClose={() => setToastMessage("")}
        />
      )}
      
      <header className="page-header">
        <div className="header-content">
          <h1>My Posts</h1>
          <p className="page-subtitle">Manage your published posts and drafts</p>
        </div>
        <Button
          onClick={() => {
            setEditingPost(null);
            setShowEditor(true);
          }}
          variant="primary"
          size="large"
        >
          + Create New Post
        </Button>
      </header>

      {showEditor && (
        <PostEditor
          post={editingPost}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingPost(null);
          }}
          mode={editingPost ? 'edit' : 'create'}
        />
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!showEditor && (
        <>
          {posts.length === 0 ? (
            <Card className="empty-state-card">
              <div className="empty-state">
                <h3>No posts yet</h3>
                <p>You haven't created any posts. Start by creating your first post!</p>
                <Button
                  onClick={() => setShowEditor(true)}
                  variant="primary"
                >
                  Create Your First Post
                </Button>
              </div>
            </Card>
          ) : (
            <div className="posts-container">
              <div className="posts-grid">
                {posts.map((post) => (
                  <Card key={post.id} className="post-card">
                    <div className="post-card-header">
                      <div className="post-status">
                        <span className={`status-badge status-${post.status}`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="post-actions">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => handleEdit(post)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger-outline"
                          size="small"
                          onClick={() => handleDelete(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                      <div className="post-card-image">
                        <img
                          src={post._embedded["wp:featuredmedia"][0].source_url}
                          alt={post.title.rendered}
                        />
                      </div>
                    )}
                    
                    <div className="post-card-content">
                      <Link to={`/post/${post.slug}`} className="post-card-title">
                        <h3>{post.title.rendered}</h3>
                      </Link>
                      
                      <div className="post-card-excerpt">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: post.excerpt.rendered.substring(0, 100) + '...' 
                          }}
                        />
                      </div>

                      <div className="post-card-meta">
                        <span className="meta-date">
                          📅 {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="meta-comments">
                          💬 {post._embedded?.replies ? post._embedded.replies[0].length : 0}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyPostsPage;