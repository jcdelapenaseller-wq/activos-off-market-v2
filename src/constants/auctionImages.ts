export const PROPERTY_IMAGES: Record<string, string[]> = {
  piso: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", // Salón real
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80", // Cocina real
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", // Dormitorio real
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", // Salón real
    "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80", // Baño real
    "https://images.unsplash.com/photo-1536376074432-a2283b2b4205?auto=format&fit=crop&w=1200&q=80"  // Comedor real
  ],
  casa: [
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80", // Fachada real
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80", // Jardín real
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", // Casa real
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", // Mansión real
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", // Cocina real
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"  // Jardín real
  ],
  local: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80", // Tienda real
    "https://images.unsplash.com/photo-1555658636-6e4a365287f3?auto=format&fit=crop&w=1200&q=80", // Oficina real
    "https://images.unsplash.com/photo-1534345180632-85d7e4835677?auto=format&fit=crop&w=1200&q=80", // Local real
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80", // Sala real
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80", // Nave real
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"  // Espacio real
  ],
  default: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80", // Inmobiliaria real
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80", // Edificio real
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"  // Rascacielos real
  ]
};

export const getImageForPropertyType = (type: string | undefined, seed: string, index: number = 0): string => {
  const normalizedType = type?.toLowerCase() || 'default';
  const images = PROPERTY_IMAGES[normalizedType] || PROPERTY_IMAGES.default;
  
  // Use seed length + index to pick an image for better rotation
  const finalIndex = (seed.length + index) % images.length;
  return images[finalIndex];
};
