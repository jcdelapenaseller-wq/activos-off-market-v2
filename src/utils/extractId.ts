export const extractId = (input: string) => {
  if (input.includes('idealista.com/inmueble/')) {
    return { type: 'idealista', value: input };
  }
  if (input.includes('id=')) {
    try {
      const url = new URL(input);
      return { type: 'boe', value: url.searchParams.get('id') || input };
    } catch {
      return { type: 'id', value: input };
    }
  }
  return { type: 'id', value: input };
};
