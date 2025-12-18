import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import "../css/DashboardPage.css";

const DashboardPage = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPosts: 0,
    myPosts: 0,
    totalViews: 0,
    categories: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user's posts
        if (auth?.token) {
          const userRes = await fetch(`${import.meta.env.VITE_WP_API_URL}/wp/v2/users/me`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
          
          if (userRes.ok) {
            const userData = await userRes.json();
            
            // Fetch user's posts
            const postsRes = await fetch(
              `${import.meta.env.VITE_WP_API_URL}/wp/v2/posts?author=${userData.id}&per_page=5&_embed`,
              { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            
            if (postsRes.ok) {
              const posts = await postsRes.json();
              const myPostsCount = parseInt(postsRes.headers.get('X-WP-Total') || '0');
              
              // Fetch all posts count
              const allPostsRes = await fetch(`${import.meta.env.VITE_WP_API_URL}/wp/v2/posts?per_page=1`);
              const totalPosts = parseInt(allPostsRes.headers.get('X-WP-Total') || '0');
              
              // Fetch categories count
              const categoriesRes = await fetch(`${import.meta.env.VITE_WP_API_URL}/wp/v2/categories?per_page=1`);
              const categoriesCount = parseInt(categoriesRes.headers.get('X-WP-Total') || '0');
              
              setStats({
                totalPosts,
                myPosts: myPostsCount,
                totalViews: Math.floor(Math.random() * 1000), // Mock data
                categories: categoriesCount
              });
              
              setRecentPosts(posts);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth]);

  if (loading) {
    return (
      <div className="content-container">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {auth?.user?.name || auth?.user?.display_name || 'User'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.myPosts}</h3>
            <p>My Posts</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>{stats.totalViews.toLocaleString()}</h3>
            <p>Total Views</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <h3>{stats.categories}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Posts</h2>
          <Link to="/my-posts" className="view-all-link">View All →</Link>
        </div>
        
        {recentPosts.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any posts yet.</p>
            <Link to="/" className="create-post-link">Browse Posts</Link>
          </div>
        ) : (
          <div className="recent-posts">
            {recentPosts.map((post) => (
              <div key={post.id} className="recent-post-card">
                {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
                  <img
                    src={post._embedded["wp:featuredmedia"][0].source_url}
                    alt={post.title.rendered}
                    className="post-thumbnail"
                  />
                )}
                <div className="post-info">
                  <h4>
                    <Link to={`/post/${post.slug}`}>
                      {post.title.rendered}
                    </Link>
                  </h4>
                  <div className="post-meta">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/my-posts" className="action-card">
            <div className="action-icon">📝</div>
            <div className="action-content">
              <h4>My Posts</h4>
              <p>View and manage your posts</p>
            </div>
          </Link>
          
          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-content">
              <h4>Edit Profile</h4>
              <p>Update your account information</p>
            </div>
          </Link>
          
          <Link to="/" className="action-card">
            <div className="action-icon">🏠</div>
            <div className="action-content">
              <h4>Home</h4>
              <p>Browse all posts</p>
            </div>
          </Link>
          
          <Link to="/settings" className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>Settings</h4>
              <p>Configure your preferences</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
