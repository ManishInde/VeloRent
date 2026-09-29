import { Vehicle } from '@/types';

/**
 * PHASE 11F — Centralized Authoritative Vehicle Image Resolver
 *
 * Exact 1–50 seeded vehicle mapping based on database/07_sample_data.sql.
 * Resolution Hierarchy:
 *   1. Exact vehicle ID (1–50)
 *   2. Exact brand + model
 *   3. Model family
 *   4. Category + fuel/body type
 *   5. Generic category fallback
 *
 * All assets are locally hosted under /vehicles/ with zero external dependencies.
 */

export const VEHICLE_IMAGE_MAP_BY_ID: Record<number, string> = {
  // HATCHBACKS (IDs 1–10)
  1: '/vehicles/swift.jpg',           // Maruti Swift
  2: '/vehicles/swift.jpg',           // Maruti WagonR
  3: '/vehicles/baleno.jpg',          // Hyundai i20
  4: '/vehicles/baleno.jpg',          // Tata Altroz
  5: '/vehicles/baleno.jpg',          // Maruti Baleno
  6: '/vehicles/swift.jpg',           // Volkswagen Polo
  7: '/vehicles/swift.jpg',           // Renault Kwid
  8: '/vehicles/swift.jpg',           // Hyundai Santro
  9: '/vehicles/baleno.jpg',          // Tata Tiago
  10: '/vehicles/swift.jpg',          // Maruti Celerio

  // SEDANS (IDs 11–18)
  11: '/vehicles/city.jpg',           // Honda City
  12: '/vehicles/city.jpg',           // Maruti Dzire
  13: '/vehicles/city.jpg',           // Hyundai Aura
  14: '/vehicles/city.jpg',           // Toyota Yaris
  15: '/vehicles/city.jpg',           // Skoda Slavia
  16: '/vehicles/city.jpg',           // Volkswagen Vento
  17: '/vehicles/city.jpg',           // Honda Amaze
  18: '/vehicles/city.jpg',           // Tata Tigor

  // SUVs (IDs 19–28)
  19: '/vehicles/creta.jpg',          // Hyundai Creta
  20: '/vehicles/nexon.jpg',          // Tata Nexon (ICE)
  21: '/vehicles/seltos.jpg',         // Kia Seltos
  22: '/vehicles/creta.jpg',          // MG Hector
  23: '/vehicles/scorpio_n.jpg',      // Mahindra Scorpio-N
  24: '/vehicles/fortuner.jpg',       // Toyota Fortuner
  25: '/vehicles/nexon.jpg',          // Maruti Brezza
  26: '/vehicles/seltos.jpg',         // Hyundai Venue
  27: '/vehicles/nexon.jpg',          // Ford EcoSport
  28: '/vehicles/creta.jpg',          // Nissan Magnite

  // LUXURY (IDs 29–34)
  29: '/vehicles/bmw_3series.jpg',    // BMW 3 Series
  30: '/vehicles/c_class.jpg',        // Mercedes C-Class
  31: '/vehicles/c_class.jpg',        // Audi A4
  32: '/vehicles/bmw_3series.jpg',    // BMW 5 Series
  33: '/vehicles/bmw_3series.jpg',    // Jaguar XE
  34: '/vehicles/c_class.jpg',        // Volvo S90

  // ELECTRIC FOUR-WHEELERS & TWO-WHEELERS (IDs 35–42)
  35: '/vehicles/nexon_ev.jpg',       // Tata Nexon EV
  36: '/vehicles/nexon_ev.jpg',       // Tata Tigor EV
  37: '/vehicles/nexon_ev.jpg',       // MG ZS EV
  38: '/vehicles/nexon_ev.jpg',       // Hyundai Kona Electric
  39: '/vehicles/ola_s1_pro.jpg',     // Ola S1 Pro (CRITICAL: Electric Scooter)
  40: '/vehicles/nexon_ev.jpg',       // Tata Punch EV
  41: '/vehicles/bmw_ix1.jpg',        // BMW iX1 (CRITICAL: Electric Luxury SUV)
  42: '/vehicles/xev_9e.jpg',         // Mahindra XEV 9e (CRITICAL: Electric Coupe SUV)

  // BIKES & SCOOTERS (IDs 43–50)
  43: '/vehicles/classic_350.jpg',    // Royal Enfield Classic 350
  44: '/vehicles/cb300r.jpg',         // Honda CB300R (Neo Sports Cafe)
  45: '/vehicles/pulsar_ns200.jpg',   // Bajaj Pulsar NS200 (Streetfighter)
  46: '/vehicles/mt15.jpg',           // Yamaha MT-15 (Hyper-Naked)
  47: '/vehicles/duke_200.jpg',       // KTM Duke 200 (Orange Trellis)
  48: '/vehicles/meteor_350.jpg',     // Royal Enfield Meteor 350 (Cruiser)
  49: '/vehicles/activa_6g.jpg',      // Honda Activa 6G (Pearl Blue Commuter)
  50: '/vehicles/jupiter.jpg',        // TVS Jupiter (Matte Blue Commuter)
};

export const BRAND_MODEL_IMAGE_MAP: Record<string, string> = {
  'tata nexon ev': '/vehicles/nexon_ev.jpg',
  'tata nexon': '/vehicles/nexon.jpg',
  'bmw ix1': '/vehicles/bmw_ix1.jpg',
  'bmw 3 series': '/vehicles/bmw_3series.jpg',
  'bmw 5 series': '/vehicles/bmw_3series.jpg',
  'mahindra xev 9e': '/vehicles/xev_9e.jpg',
  'mahindra scorpio-n': '/vehicles/scorpio_n.jpg',
  'mahindra scorpio n': '/vehicles/scorpio_n.jpg',
  'ola s1 pro': '/vehicles/ola_s1_pro.jpg',
  'ola s1': '/vehicles/ola_s1_pro.jpg',
  'royal enfield classic 350': '/vehicles/classic_350.jpg',
  'royal enfield meteor 350': '/vehicles/meteor_350.jpg',
  'honda cb300r': '/vehicles/cb300r.jpg',
  'bajaj pulsar ns200': '/vehicles/pulsar_ns200.jpg',
  'yamaha mt-15': '/vehicles/mt15.jpg',
  'yamaha mt 15': '/vehicles/mt15.jpg',
  'ktm duke 200': '/vehicles/duke_200.jpg',
  'ktm 200 duke': '/vehicles/duke_200.jpg',
  'honda activa 6g': '/vehicles/activa_6g.jpg',
  'tvs jupiter': '/vehicles/jupiter.jpg',
};

const MODEL_IMAGE_MAP: Record<string, string> = {
  // SUVs
  creta: '/vehicles/creta.jpg',
  nexon: '/vehicles/nexon.jpg',
  seltos: '/vehicles/seltos.jpg',
  scorpio: '/vehicles/scorpio_n.jpg',
  'scorpio-n': '/vehicles/scorpio_n.jpg',
  'scorpio n': '/vehicles/scorpio_n.jpg',
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

  // Luxury & Premium Sedans
  '3 series': '/vehicles/bmw_3series.jpg',
  '5 series': '/vehicles/bmw_3series.jpg',
  'c-class': '/vehicles/c_class.jpg',
  a4: '/vehicles/c_class.jpg',
  xe: '/vehicles/bmw_3series.jpg',
  s90: '/vehicles/c_class.jpg',

  // Electric Four-Wheelers
  'nexon ev': '/vehicles/nexon_ev.jpg',
  'tigor ev': '/vehicles/nexon_ev.jpg',
  'zs ev': '/vehicles/nexon_ev.jpg',
  'kona electric': '/vehicles/nexon_ev.jpg',
  'punch ev': '/vehicles/nexon_ev.jpg',
  ix1: '/vehicles/bmw_ix1.jpg',
  'xev 9e': '/vehicles/xev_9e.jpg',

  // Classic & Cruiser Motorcycles
  'classic 350': '/vehicles/classic_350.jpg',
  'meteor 350': '/vehicles/meteor_350.jpg',
  'bullet 350': '/vehicles/classic_350.jpg',
  'hunter 350': '/vehicles/classic_350.jpg',

  // Sport & Naked Motorcycles
  cb300r: '/vehicles/cb300r.jpg',
  'pulsar ns200': '/vehicles/pulsar_ns200.jpg',
  pulsar: '/vehicles/pulsar_ns200.jpg',
  ns200: '/vehicles/pulsar_ns200.jpg',
  'mt-15': '/vehicles/mt15.jpg',
  'mt 15': '/vehicles/mt15.jpg',
  'duke 200': '/vehicles/duke_200.jpg',
  duke: '/vehicles/duke_200.jpg',

  // Commuter Scooters
  'activa 6g': '/vehicles/activa_6g.jpg',
  activa: '/vehicles/activa_6g.jpg',
  jupiter: '/vehicles/jupiter.jpg',
  dio: '/vehicles/activa_6g.jpg',
  'access 125': '/vehicles/activa_6g.jpg',
  ntorq: '/vehicles/jupiter.jpg',

  // Electric Two-Wheelers / Scooters
  's1 pro': '/vehicles/ola_s1_pro.jpg',
  s1: '/vehicles/ola_s1_pro.jpg',
  'ola s1 pro': '/vehicles/ola_s1_pro.jpg',
  'ola s1': '/vehicles/ola_s1_pro.jpg',
  'ather 450x': '/vehicles/ola_s1_pro.jpg',
  ather: '/vehicles/ola_s1_pro.jpg',
};

const CATEGORY_DEFAULT_MAP: Record<string, string> = {
  hatchback: '/vehicles/categories/hatchback.jpg',
  sedan: '/vehicles/categories/sedan.jpg',
  suv: '/vehicles/categories/suv.jpg',
  luxury: '/vehicles/categories/luxury-sedan.jpg',
  'premium sedan': '/vehicles/categories/luxury-sedan.jpg',
  electric: '/vehicles/categories/electric-suv.jpg',
  bike: '/vehicles/categories/motorcycle.jpg',
};

/**
 * Returns the authoritative locally-hosted static URL of the matching vehicle photograph based on:
 * 1. Exact vehicle ID (1–50)
 * 2. Exact brand + model
 * 3. Model family
 * 4. Category + fuel/body type
 * 5. Generic category fallback
 */
export function getVehicleImageUrl(vehicle?: Partial<Vehicle> | null): string {
  if (!vehicle) return '/vehicles/creta.jpg';

  // 1. Exact Vehicle ID (Highest Priority: guarantees 100% precision for seeded fleet)
  if (vehicle.id && VEHICLE_IMAGE_MAP_BY_ID[vehicle.id]) {
    return VEHICLE_IMAGE_MAP_BY_ID[vehicle.id];
  }

  const modelKey = (vehicle.model || '').toLowerCase().trim();
  const brandKey = (vehicle.brand || '').toLowerCase().trim();
  const fullNameKey = `${brandKey} ${modelKey}`.trim();
  const fuelKey = (vehicle.fuelType || '').toUpperCase().trim();
  const categoryKey = (vehicle.type || '').toLowerCase().trim();
  const seats = vehicle.seats || 0;
  const isTwoWheeler = categoryKey.includes('bike') || seats <= 2;

  // 2. Exact Brand + Model match
  if (fullNameKey && BRAND_MODEL_IMAGE_MAP[fullNameKey]) {
    return BRAND_MODEL_IMAGE_MAP[fullNameKey];
  }

  // 3. Exact Model name match
  if (modelKey && MODEL_IMAGE_MAP[modelKey]) {
    return MODEL_IMAGE_MAP[modelKey];
  }

  // 4. Substring model match for compound names
  for (const [key, path] of Object.entries(MODEL_IMAGE_MAP)) {
    if (modelKey.includes(key) || key.includes(modelKey)) {
      return path;
    }
  }

  // 5. Electric Two-Wheeler vs Electric Four-Wheeler safety
  if (fuelKey === 'ELECTRIC') {
    if (isTwoWheeler) {
      return '/vehicles/ola_s1_pro.jpg';
    }
    return '/vehicles/nexon_ev.jpg';
  }

  // 6. Two-Wheeler subcategory resolution: Commuter Scooter vs Sportbike vs Cruiser
  if (isTwoWheeler) {
    const isScooter =
      modelKey.includes('activa') ||
      modelKey.includes('jupiter') ||
      modelKey.includes('scooter') ||
      modelKey.includes('dio') ||
      modelKey.includes('access') ||
      modelKey.includes('ntorq');

    if (isScooter) {
      return '/vehicles/activa_6g.jpg';
    }

    if (modelKey.includes('meteor')) {
      return '/vehicles/meteor_350.jpg';
    }

    const isClassic =
      brandKey.includes('royal enfield') ||
      modelKey.includes('classic') ||
      modelKey.includes('bullet') ||
      modelKey.includes('hunter');

    if (isClassic) {
      return '/vehicles/classic_350.jpg';
    }

    return '/vehicles/duke_200.jpg';
  }

  // 7. Category fallback
  if (CATEGORY_DEFAULT_MAP[categoryKey]) {
    return CATEGORY_DEFAULT_MAP[categoryKey];
  }

  return '/vehicles/categories/suv.jpg';
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
