import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  return (
    <div className="full-page">
      <div className="card text-center">
        <h2>Oops! Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="button">Go Back Home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
