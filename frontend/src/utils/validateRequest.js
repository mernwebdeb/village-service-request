const validateRequest = (formData) => {
  const errors = {};

  if (!formData.title.trim()) {
    errors.title = 'Request title is required';
  } else if (formData.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!formData.category) {
    errors.category = 'Please select a category';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (!formData.location.trim()) {
    errors.location = 'Location is required';
  }

  return errors;
};

export default validateRequest;