import { Vehicle } from '@/types';

/**
 * Deterministic vehicle image resolution based on real backend vehicle models and categories.
 * All assets are locally hosted in /vehicles/ with zero external dependencies.
 */
const MODEL_IMAGE_MAP: Record<string, string> = {
  // SUVs
  creta: '/vehicles/creta.jpg',
  nexon: '/vehicles/nexon.jpg',
  seltos: '/vehicles/seltos.jpg',
  scorpio: '/vehicles/scorpio_n.jpg',
  'scorpio-n': '/vehicles/scorpio_n.jpg',
  fortuner: '/vehicles/fortuner.jpg',
  hector: '/vehicles/creta.jpg',
  brezza: '/vehicles/nexon.jpg',
  venue: '/vehicles/seltos.jpg',
  ecosport: '/vehicles/nexon.jpg',
  magnite: '/vehicles/creta.jpg',

  // Hatchbacks
  swift: '/vehicles/swift.jpg',
  baleno: '/vehicles/baleno.jpg',
  wagonr: '/vehicles/swift.jpg',
  i20: '/vehicles/baleno.jpg',
  altroz: '/vehicles/baleno.jpg',
  polo: '/vehicles/swift.jpg',
  kwid: '/vehicles/swift.jpg',
  santro: '/vehicles/swift.jpg',
  tiago: '/vehicles/baleno.jpg',
  celerio: '/vehicles/swift.jpg',

  // Sedans
  city: '/vehicles/city.jpg',
  dzire: '/vehicles/city.jpg',
  aura: '/vehicles/city.jpg',
  yaris: '/vehicles/city.jpg',
  slavia: '/vehicles/city.jpg',
  vento: '/vehicles/city.jpg',
  amaze: '/vehicles/city.jpg',
  tigor: '/vehicles/city.jpg',

  // Luxury
  '3 series': '/vehicles/bmw_3series.jpg',
  '5 series': '/vehicles/bmw_3series.jpg',
  'c-class': '/vehicles/c_class.jpg',
  a4: '/vehicles/c_class.jpg',
  xe: '/vehicles/bmw_3series.jpg',
  s90: '/vehicles/c_class.jpg',

  // Electric
  'nexon ev': '/vehicles/nexon_ev.jpg',
  'tigor ev': '/vehicles/nexon_ev.jpg',
  'zs ev': '/vehicles/nexon_ev.jpg',
  'kona electric': '/vehicles/nexon_ev.jpg',
  'punch ev': '/vehicles/nexon_ev.jpg',
  ix1: '/vehicles/nexon_ev.jpg',
  'xev 9e': '/vehicles/nexon_ev.jpg',

  // Bikes & Two-Wheelers
  'classic 350': '/vehicles/classic_350.jpg',
  'meteor 350': '/vehicles/classic_350.jpg',
  cb300r: '/vehicles/classic_350.jpg',
  'pulsar ns200': '/vehicles/classic_350.jpg',
  'mt-15': '/vehicles/classic_350.jpg',
  'duke 200': '/vehicles/classic_350.jpg',
  'activa 6g': '/vehicles/classic_350.jpg',
  jupiter: '/vehicles/classic_350.jpg',
  's1 pro': '/vehicles/classic_350.jpg',
};

const CATEGORY_DEFAULT_MAP: Record<string, string> = {
  hatchback: '/vehicles/swift.jpg',
  sedan: '/vehicles/city.jpg',
  suv: '/vehicles/creta.jpg',
  luxury: '/vehicles/bmw_3series.jpg',
  electric: '/vehicles/nexon_ev.jpg',
  bike: '/vehicles/classic_350.jpg',
};

/**
 * Returns the absolute static URL of the matching vehicle photograph.
 */
export function getVehicleImageUrl(vehicle?: Partial<Vehicle> | null): string {
  if (!vehicle) return '/vehicles/creta.jpg';

  const modelKey = (vehicle.model || '').toLowerCase().trim();
  if (MODEL_IMAGE_MAP[modelKey]) {
    return MODEL_IMAGE_MAP[modelKey];
  }

  // Substring match for compound names
  for (const [key, path] of Object.entries(MODEL_IMAGE_MAP)) {
    if (modelKey.includes(key) || key.includes(modelKey)) {
      return path;
    }
  }

  // Category fallback
  const categoryKey = (vehicle.type || '').toLowerCase().trim();
  if (CATEGORY_DEFAULT_MAP[categoryKey]) {
    return CATEGORY_DEFAULT_MAP[categoryKey];
  }

  return '/vehicles/creta.jpg';
}

/**
 * Generates descriptive accessibility alt text.
 */
export function getVehicleImageAlt(vehicle?: Partial<Vehicle> | null): string {
  if (!vehicle) return 'VeloRent vehicle';
  const brand = vehicle.brand || '';
  const model = vehicle.model || '';
  const type = vehicle.type || 'Vehicle';
  return `${brand} ${model} ${type}`.trim();
}
