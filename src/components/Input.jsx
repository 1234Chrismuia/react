function Input(props) {
  return (
    <input
      style={{
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginBottom: '8px'
      }}
      {...props}
    />
  );
}
export default Input;