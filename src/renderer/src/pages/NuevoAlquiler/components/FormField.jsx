const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  autoFocus,
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
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default FormField;
