import { useRouteError, Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import "../css/ErrorPage.css";  

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="content-container">
      <div className="error-page">
        <Card className="error-card">
          <div className="error-content">
            <h1 className="error-title">Oops! Page Not Found</h1>
            <p className="error-message">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            {error?.statusText || error?.message ? (
              <div className="error-details">
                <p>
                  <strong>Error:</strong> {error.statusText || error.message}
                </p>
              </div>
            ) : null}
            
            <div className="error-actions">
              <Link to="/">
                <Button variant="primary">Go to Homepage</Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
            
            <div className="error-links">
              <p>You might be looking for:</p>
              <ul>
                <li><Link to="/">Home Page</Link></li>
                <li><Link to="/my-posts">My Posts (requires login)</Link></li>
                <li><Link to="/login">Login Page</Link></li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
