const colors_ = [
  '#ffff00', // yellow
  '#007bff', // blue
  '#28a745', // green
  '#ff4500', // red
  '#fc88ab', // pink
  '#8a54ce', // purple
];

export const colors = colors_;
export const defaultColor = colors_[0];
export const colorToClassName = color => {
  color = color || defaultColor;
  return color.replace('#', 'web-note-');
};
