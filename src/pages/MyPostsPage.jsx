import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import Card from "../components/Card";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = `${import.meta.env.VITE_WP_API_URL}/wp/v2`;

function MyPostsPage() {
  const { auth } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
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
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/posts?author=${userId}&_embed`, {
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
    }
    fetchPosts();
  }, [userId, auth]);

  if (loading) return <Loader />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>My Posts</h1>
      {posts.length === 0 ? (
        <div>No posts found for your user.</div>
      ) : (
        posts.map(post => (
          <Card key={post.id}>
            {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url && (
              <img
                src={post._embedded["wp:featuredmedia"][0].source_url}
                alt={post.title.rendered}
                style={{ width: "100%", borderRadius: "4px" }}
              />
            )}
            <Link to={`/post/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <h2>{post.title.rendered}</h2>
            </Link>
            <div
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              style={{ marginBottom: "8px" }}
            />
          </Card>
        ))
      )}
    </div>
  );
}

export default MyPostsPage;