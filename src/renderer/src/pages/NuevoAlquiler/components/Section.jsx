const Section = ({ title, children }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};

export default Section;
