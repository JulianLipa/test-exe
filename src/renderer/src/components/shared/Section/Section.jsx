const Section = ({ title, children }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 className="mb-5 mt-5">{title}</h3>
      <div className="flex gap-5 flex-wrap w-full">{children}</div>
    </div>
  );
};

export default Section;
