class Vector2 {
  static norm = (value, min, max) => {
    return (value - min) / (max - min);
  };

  static lerp = (norm, min, max) => {
    return (max - min) * norm + min;
  };

  static map = (value, sourceMin, sourceMax, destMin, destMax) => {
    return this.lerp(this.norm(value, sourceMin, sourceMax), destMin, destMax);
  };

  static clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };
}

export default Vector2;
