// components/Card.jsx
function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;