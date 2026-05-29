const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 10 }}>
      <p>{label}</p>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        type={type}
        required={required}
      />
    </div>
  );
};

export default FormField;
