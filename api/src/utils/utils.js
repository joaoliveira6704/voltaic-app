const generateUniqueId = () => {
  return crypto.randomUUID();
};

export default generateUniqueId;
