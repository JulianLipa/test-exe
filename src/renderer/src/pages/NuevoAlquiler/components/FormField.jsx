const FormField = ({ label, ...props }) => {
  return (
    <div className="flex flex-col">
      <p>{label}</p>
      <input {...props} />
    </div>
  );
};

export default FormField;
