import { normalizeLocationName } from './src/utils/auctionNormalizer';

const examples = [
  "Madrid",
  "Barcelona",
  "Sevilla",
  "Valencia",
  "Zaragoza",
  "Málaga",
  "Malaga",
  "Málaga (Capital)",
  "Alacant",
  "Móstoles, 28932",
  "l'Hospitalet de Llobregat",
  "A CORUÑA",
  "Vitoria-Gasteiz",
  "Palma de Mallorca",
  "San Sebastián de los Reyes"
];

console.log("--- TEST NORMALIZADOR ---");
examples.forEach(ex => {
  console.log(`Entrada: "${ex}" -> Salida: "${normalizeLocationName(ex)}"`);
});
