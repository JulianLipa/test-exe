const Section = ({ title, children }) => {
  return (
    <div>
      <h3 className="mt-5">{title}</h3>
      <div className="flex gap-5 mb-5 mt-5 flex-wrap">{children}</div>
    </div>
  );
};

export default Section;
