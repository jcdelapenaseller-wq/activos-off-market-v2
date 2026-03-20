export const PROPERTY_IMAGES: Record<string, string[]> = {
  piso: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
  ],
  casa: [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
  ],
  local: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555658636-6e4a365287f3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534345180632-85d7e4835677?auto=format&fit=crop&w=800&q=80"
  ],
  default: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
  ]
};

export const getImageForPropertyType = (type: string | undefined, seed: string): string => {
  const normalizedType = type?.toLowerCase() || 'default';
  const images = PROPERTY_IMAGES[normalizedType] || PROPERTY_IMAGES.default;
  // Use seed length to pick an index
  const index = seed.length % images.length;
  return images[index];
};
