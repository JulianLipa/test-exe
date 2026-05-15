export const createInitialForm = (config, base = {}) => {
  const form = { ...base };

  config.forEach((section) => {
    section.fields.forEach((field) => {
      const keys = field.name.split(".");
      let current = form;

      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          current[key] = "";
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    });
  });

  return form;
};
