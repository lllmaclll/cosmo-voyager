import { CelestialBody, Mission, DialogueLine, DatabaseCategory } from './types';
import { Star, Atom, Orbit, VenetianMask, Sparkles, Zap, Binary, Rocket, Sprout, Milestone } from 'lucide-react';


// Scale factor for the "universe"
const UNIVERSE_SCALE = 2000;

// Helper to generate asteroid belt
const generateAsteroidBelt = (count: number, minDist: number, maxDist: number): CelestialBody[] => {
  const asteroids: CelestialBody[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDist + Math.random() * (maxDist - minDist);
    // Add some random variation to not make it a perfect circle
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    asteroids.push({
      id: `asteroid-${i}-${minDist}`,
      name: `Asteroid ${i}`,
      thaiName: 'อุกกาบาต',
      type: 'ASTEROID',
      color: '#475569', // Slate-600
      size: Math.random() * 3 + 1, // Random size 1-4px
      distanceFromSun: distance,
      position: { x, y },
      orbitSpeed: 0.0005 + (Math.random() * 0.0002), // Slightly varying speeds
      angle: angle // Store initial angle
    });
  }
  return asteroids;
};

// Main Bodies
const MAIN_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'Sun',
    thaiName: 'ดวงอาทิตย์',
    type: 'STAR',
    color: '#fbbf24',
    // Realistic Sun: Smooth radial gradient to simulate glowing orb
    gradient: 'radial-gradient(circle, #ffffff 0%, #fcd34d 40%, #fbbf24 70%, #f59e0b 100%)',
    size: 200,
    distanceFromSun: 0,
    position: { x: 0, y: 0 },
    orbitSpeed: 0
  },
  {
    id: 'mercury',
    name: 'Mercury',
    thaiName: 'ดาวพุธ',
    type: 'PLANET',
    color: '#a1a1aa',
    // Mercury: Grey, rocky, barren, cratered look
    gradient: 'radial-gradient(circle at 30% 30%, #f1f5f9 0%, #cbd5e1 20%, #94a3b8 50%, #64748b 80%, #334155 100%)',
    size: 20,
    distanceFromSun: 0.15 * UNIVERSE_SCALE,
    position: { x: 0.15 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.004
  },
  {
    id: 'venus',
    name: 'Venus',
    thaiName: 'ดาวศุกร์',
    type: 'PLANET',
    color: '#fbbf24',
    // Venus: Thick sulfuric acid clouds, yellowish-white, smooth but hazy
    gradient: 'radial-gradient(circle at 35% 35%, #fff7ed 0%, #fed7aa 20%, #fbbf24 50%, #d97706 80%, #9a3412 100%)',
    size: 35,
    distanceFromSun: 0.25 * UNIVERSE_SCALE,
    position: { x: 0.25 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.003
  },
  {
    id: 'earth',
    name: 'Earth',
    thaiName: 'โลก',
    type: 'PLANET',
    color: '#3b82f6',
    // Earth: Complex. Deep blue oceans, distinct green continents, white cloud swirls
    gradient: 'radial-gradient(circle at 50% 50%, #60a5fa 0%, #2563eb 40%, #1e3a8a 80%, #0f172a 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px)',
    size: 38,
    distanceFromSun: 0.38 * UNIVERSE_SCALE,
    position: { x: 0.38 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.002
  },
  {
    id: 'moon',
    name: 'Moon',
    thaiName: 'ดวงจันทร์',
    type: 'MOON',
    color: '#e2e8f0',
    // Moon: Pale grey, very dusty
    gradient: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 20%, #94a3b8 60%, #475569 100%)',
    size: 10,
    distanceFromSun: 0.38 * UNIVERSE_SCALE,
    position: { x: 0.38 * UNIVERSE_SCALE + 60, y: 60 }, 
    orbitSpeed: 0.002
  },
  {
    id: 'mars',
    name: 'Mars',
    thaiName: 'ดาวอังคาร',
    type: 'PLANET',
    color: '#ef4444',
    // Mars: Rusty red, orange dust, dark patches
    gradient: 'radial-gradient(circle at 40% 40%, #fdba74 0%, #fb923c 25%, #ef4444 50%, #b91c1c 80%, #7f1d1d 100%)',
    size: 25,
    distanceFromSun: 0.52 * UNIVERSE_SCALE,
    position: { x: 0.52 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.0018
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    thaiName: 'ดาวพฤหัสบดี',
    type: 'PLANET',
    color: '#d97706',
    // Jupiter: Distinct horizontal bands of cream, brown, orange
    gradient: `linear-gradient(170deg, 
        #92400e 0%, 
        #b45309 10%, 
        #d97706 15%, 
        #fde68a 25%, 
        #b45309 35%, 
        #92400e 45%, 
        #fde68a 50%, 
        #b45309 60%, 
        #d97706 70%, 
        #92400e 85%, 
        #78350f 100%)`,
    size: 100,
    distanceFromSun: 0.9 * UNIVERSE_SCALE,
    position: { x: 0.9 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.001
  },
  {
    id: 'saturn',
    name: 'Saturn',
    thaiName: 'ดาวเสาร์',
    type: 'PLANET',
    color: '#fde047',
    // Saturn: Pale gold/beige, softer bands than Jupiter
    gradient: `linear-gradient(160deg,
        #a16207 0%,
        #ca8a04 20%,
        #eab308 40%,
        #fef08a 50%,
        #eab308 60%,
        #ca8a04 80%,
        #854d0e 100%)`,
    size: 85,
    distanceFromSun: 1.3 * UNIVERSE_SCALE,
    position: { x: 1.3 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.0008
  },
  {
    id: 'titan',
    name: 'Titan',
    thaiName: 'ไททัน (ดวงจันทร์)',
    type: 'MOON',
    color: '#fbbf24',
    // Titan: Opaque orange haze
    gradient: 'radial-gradient(circle at 30% 30%, #fef3c7 0%, #fcd34d 40%, #d97706 100%)',
    size: 12,
    distanceFromSun: 1.3 * UNIVERSE_SCALE,
    position: { x: 1.3 * UNIVERSE_SCALE + 120, y: -80 },
    orbitSpeed: 0.0008
  },
  {
    id: 'uranus',
    name: 'Uranus',
    thaiName: 'ดาวยูเรนัส',
    type: 'PLANET',
    color: '#22d3ee',
    // Uranus: Featureless pale cyan/light blue
    gradient: 'radial-gradient(circle at 30% 30%, #ecfeff 0%, #a5f3fc 30%, #22d3ee 70%, #0891b2 100%)',
    size: 60,
    distanceFromSun: 1.7 * UNIVERSE_SCALE,
    position: { x: 1.7 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.0005
  },
  {
    id: 'neptune',
    name: 'Neptune',
    thaiName: 'ดาวเนปจูน',
    type: 'PLANET',
    color: '#3b82f6',
    // Neptune: Deep azure blue, storm spots
    gradient: 'radial-gradient(circle at 30% 30%, #93c5fd 0%, #3b82f6 30%, #1d4ed8 70%, #1e3a8a 100%)',
    size: 58,
    distanceFromSun: 2.1 * UNIVERSE_SCALE,
    position: { x: 2.1 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.0004
  },
  {
    id: 'pluto',
    name: 'Pluto',
    thaiName: 'ดาวพลูโต',
    type: 'DWARF_PLANET',
    color: '#94a3b8',
    // Pluto: Beige/Brown/Grey mix
    gradient: 'radial-gradient(circle at 40% 40%, #e2e8f0 0%, #cffafe 20%, #94a3b8 50%, #475569 100%)',
    size: 15,
    distanceFromSun: 2.5 * UNIVERSE_SCALE,
    position: { x: 2.5 * UNIVERSE_SCALE, y: 0 },
    orbitSpeed: 0.0003
  },
  {
    id: 'sagittarius_a',
    name: 'Sagittarius A*',
    thaiName: 'หลุมดำ (ใจกลางทางช้างเผือก)',
    type: 'BLACK_HOLE',
    color: '#000000',
    size: 120,
    distanceFromSun: 3.5 * UNIVERSE_SCALE,
    position: { x: 3.5 * UNIVERSE_SCALE, y: 1000 },
    orbitSpeed: 0
  },
  {
    id: 'andromeda',
    name: 'Andromeda',
    thaiName: 'กาแล็กซีแอนดรอเมดา',
    type: 'GALAXY',
    color: '#8b5cf6',
    size: 250,
    distanceFromSun: 4.5 * UNIVERSE_SCALE,
    position: { x: 4.5 * UNIVERSE_SCALE, y: -1500 },
    orbitSpeed: 0
  },
  {
    id: 'halley',
    name: 'Halleys Comet',
    thaiName: 'ดาวหางฮัลเลย์',
    type: 'COMET',
    color: '#a5f3fc',
    size: 8,
    distanceFromSun: 0, 
    position: { x: 1 * UNIVERSE_SCALE, y: -0.8 * UNIVERSE_SCALE }, // Starting pos
    orbitSpeed: 0.003
  },
  {
    id: 'triangulum',
    name: 'Triangulum',
    thaiName: 'กาแล็กซีสามเหลี่ยม (M33)',
    type: 'GALAXY',
    color: '#f472b6', // Pinkish
    gradient: 'radial-gradient(ellipse at center, #fce7f3 0%, #f472b6 30%, transparent 70%)',
    size: 180,
    distanceFromSun: 15 * UNIVERSE_SCALE, // Very far away (15x scale vs Andromeda's 4.5x)
    position: { x: 10 * UNIVERSE_SCALE, y: 10 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  // --- EXISTING EXTENDED OBJECTS ---
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    thaiName: 'ดาวบีเทลจุส',
    type: 'STAR',
    color: '#ef4444',
    gradient: 'radial-gradient(circle, #fee2e2 0%, #ef4444 40%, #991b1b 100%)',
    size: 450, // Massive Red Supergiant
    distanceFromSun: 0,
    position: { x: -6 * UNIVERSE_SCALE, y: 6 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'orion_nebula',
    name: 'Orion Nebula',
    thaiName: 'เนบิวลานายพราน',
    type: 'NEBULA',
    color: '#d8b4fe',
    size: 700,
    distanceFromSun: 0,
    position: { x: -6.5 * UNIVERSE_SCALE, y: 6.5 * UNIVERSE_SCALE }, // Near Betelgeuse
    orbitSpeed: 0
  },
  {
    id: 'ton618',
    name: 'TON 618',
    thaiName: 'TON 618 (ควาซาร์)',
    type: 'QUASAR',
    color: '#ffffff',
    size: 600, // Supermassive
    distanceFromSun: 0,
    position: { x: 20 * UNIVERSE_SCALE, y: -20 * UNIVERSE_SCALE }, // Extremely far
    orbitSpeed: 0
  },
  {
    id: 'proxima_centauri',
    name: 'Proxima Centauri',
    thaiName: 'พร็อกซิมา เซนทอรี',
    type: 'STAR',
    color: '#ef4444', // Red Dwarf
    gradient: 'radial-gradient(circle, #fca5a5 0%, #ef4444 60%, #7f1d1d 100%)',
    size: 100, // Small star (visually scaled for visibility)
    distanceFromSun: 0,
    position: { x: -3 * UNIVERSE_SCALE, y: -2 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'sirius',
    name: 'Sirius',
    thaiName: 'ดาวซิริอุส (ดาวโจร)',
    type: 'STAR',
    color: '#bae6fd', // Blue-white
    gradient: 'radial-gradient(circle, #e0f2fe 0%, #bae6fd 40%, #0ea5e9 100%)',
    size: 250, // Larger than Sun
    distanceFromSun: 0,
    position: { x: 2 * UNIVERSE_SCALE, y: 5 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'uy_scuti',
    name: 'UY Scuti',
    thaiName: 'UY Scuti',
    type: 'STAR',
    color: '#f87171',
    gradient: 'radial-gradient(circle, #fecaca 0%, #f87171 40%, #991b1b 100%)',
    size: 600, // Even bigger than Betelgeuse
    distanceFromSun: 0,
    position: { x: -12 * UNIVERSE_SCALE, y: -8 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'm87_black_hole',
    name: 'M87*',
    thaiName: 'หลุมดำ M87*',
    type: 'BLACK_HOLE',
    color: '#000000',
    size: 300,
    distanceFromSun: 0,
    position: { x: 15 * UNIVERSE_SCALE, y: 5 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'crab_nebula',
    name: 'Crab Nebula',
    thaiName: 'เนบิวลาปู',
    type: 'NEBULA',
    color: '#34d399', // Greenish/Multi-color
    size: 400,
    distanceFromSun: 0,
    position: { x: -8 * UNIVERSE_SCALE, y: 3 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'whirlpool_galaxy',
    name: 'Whirlpool Galaxy',
    thaiName: 'กาแล็กซีน้ำวน (M51)',
    type: 'GALAXY',
    color: '#818cf8',
    size: 350,
    distanceFromSun: 0,
    position: { x: -10 * UNIVERSE_SCALE, y: 12 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: '3c_273',
    name: '3C 273',
    thaiName: '3C 273 (ควาซาร์)',
    type: 'QUASAR',
    color: '#fff',
    size: 400,
    distanceFromSun: 0,
    position: { x: 18 * UNIVERSE_SCALE, y: -10 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'pillar_of_creation',
    name: 'Pillars of Creation',
    thaiName: 'เสาแห่งการก่อกำเนิด (Eagle Nebula)',
    type: 'NEBULA',
    color: '#fcd34d', // Gold/Brown dust
    size: 500,
    distanceFromSun: 0,
    position: { x: 5 * UNIVERSE_SCALE, y: -12 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  // --- NEWLY ADDED OBJECTS ---
  {
    id: 'sombrero_galaxy',
    name: 'Sombrero Galaxy',
    thaiName: 'กาแล็กซีหมวกปีก (M104)',
    type: 'GALAXY',
    color: '#fde68a', // Yellowish core
    size: 300,
    distanceFromSun: 0,
    position: { x: 12 * UNIVERSE_SCALE, y: 15 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'cigar_galaxy',
    name: 'Cigar Galaxy',
    thaiName: 'กาแล็กซีซิการ์ (M82)',
    type: 'GALAXY',
    color: '#ef4444', // Reddish starburst
    size: 280,
    distanceFromSun: 0,
    position: { x: -15 * UNIVERSE_SCALE, y: 10 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'cygnus_x1',
    name: 'Cygnus X-1',
    thaiName: 'Cygnus X-1 (หลุมดำ)',
    type: 'BLACK_HOLE',
    color: '#000000',
    size: 150,
    distanceFromSun: 0,
    position: { x: 8 * UNIVERSE_SCALE, y: -5 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'rigel',
    name: 'Rigel',
    thaiName: 'ดาวไรเจล',
    type: 'STAR',
    color: '#60a5fa', // Blue Supergiant
    gradient: 'radial-gradient(circle, #bfdbfe 0%, #60a5fa 40%, #1e40af 100%)',
    size: 300,
    distanceFromSun: 0,
    position: { x: -5 * UNIVERSE_SCALE, y: 8 * UNIVERSE_SCALE }, // Near Orion Nebula
    orbitSpeed: 0
  },
  {
    id: 'stephenson_2_18',
    name: 'Stephenson 2-18',
    thaiName: 'Stephenson 2-18',
    type: 'STAR',
    color: '#b91c1c', // Deep Red
    gradient: 'radial-gradient(circle, #fca5a5 0%, #b91c1c 50%, #7f1d1d 100%)',
    size: 800, // Largest known star
    distanceFromSun: 0,
    position: { x: -18 * UNIVERSE_SCALE, y: -5 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'vega',
    name: 'Vega',
    thaiName: 'ดาวเวกา',
    type: 'STAR',
    color: '#e0f2fe', // Bright White-Blue
    gradient: 'radial-gradient(circle, #ffffff 0%, #e0f2fe 40%, #7dd3fc 100%)',
    size: 220,
    distanceFromSun: 0,
    position: { x: 3 * UNIVERSE_SCALE, y: 8 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'helix_nebula',
    name: 'Helix Nebula',
    thaiName: 'เนบิวลาตาเทพเจ้า (Helix)',
    type: 'NEBULA',
    color: '#f472b6', // Pink/Orange eye
    size: 350,
    distanceFromSun: 0,
    position: { x: 6 * UNIVERSE_SCALE, y: -15 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'horsehead_nebula',
    name: 'Horsehead Nebula',
    thaiName: 'เนบิวลาหัวม้า',
    type: 'NEBULA',
    color: '#be123c', // Dark Red/Black
    size: 400,
    distanceFromSun: 0,
    position: { x: -7 * UNIVERSE_SCALE, y: 5 * UNIVERSE_SCALE }, // Near Orion
    orbitSpeed: 0
  },
  {
    id: 'keplers_supernova',
    name: 'Keplers Supernova',
    thaiName: 'ซูเปอร์โนวาของเคปเลอร์',
    type: 'SUPERNOVA',
    color: '#fbbf24', // Explosion debris
    size: 350,
    distanceFromSun: 0,
    position: { x: 9 * UNIVERSE_SCALE, y: 2 * UNIVERSE_SCALE },
    orbitSpeed: 0
  },
  {
    id: 'ulas_j1120',
    name: 'ULAS J1120+064',
    thaiName: 'ULAS J1120+064 (ควาซาร์)',
    type: 'QUASAR',
    color: '#fff',
    size: 500,
    distanceFromSun: 0,
    position: { x: 25 * UNIVERSE_SCALE, y: 5 * UNIVERSE_SCALE }, // Farthest
    orbitSpeed: 0
  }
];

// Generate Main Asteroid Belt (Between Mars and Jupiter)
const MAIN_BELT = generateAsteroidBelt(200, 0.65 * UNIVERSE_SCALE, 0.75 * UNIVERSE_SCALE);

// Generate Kuiper Belt (Beyond Neptune/Pluto)
const KUIPER_BELT = generateAsteroidBelt(300, 2.6 * UNIVERSE_SCALE, 3.2 * UNIVERSE_SCALE);

export const PLANETS: CelestialBody[] = [
  ...MAIN_BODIES,
  ...MAIN_BELT,
  ...KUIPER_BELT
];

export const INITIAL_ROCKET_POS = { x: 0.4 * UNIVERSE_SCALE, y: 0.1 * UNIVERSE_SCALE };

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "First Contact",
    description: "เริ่มต้นการเดินทาง: บินกลับไปที่โลก (Earth) เพื่อทดสอบระบบสแกน",
    targetBodyId: "earth",
    completed: false
  },
  {
    id: 2,
    title: "The Red Neighbor",
    description: "เดินทางสู่ดาวอังคาร (Mars) เพื่อนบ้านสีแดงของเรา",
    targetBodyId: "mars",
    completed: false
  },
  {
    id: 3,
    title: "King of Planets",
    description: "บินฝ่าแถบดาวเคราะห์น้อยไปยังดาวพฤหัสบดี (Jupiter)",
    targetBodyId: "jupiter",
    completed: false
  },
  {
      id: 4,
      title: "The Ring Master",
      description: "เดินทางไปชมวงแหวนอันงดงามของดาวเสาร์ (Saturn)",
      targetBodyId: "saturn",
      completed: false
  },
  {
      id: 5,
      title: "Deep Space",
      description: "เดินทางไปยังดาวเนปจูน (Neptune) ที่ขอบระบบสุริยะชั้นใน",
      targetBodyId: "neptune",
      completed: false
  }
];

export const BOSS_DIALOGUE: DialogueLine[] = [
  { speaker: 'boss', text: '...ตรวจพบผู้บุกรุกในอาณาเขตแห่งความมืดของข้า...' },
  { speaker: 'player', text: 'ยาน AI รายงาน: ตรวจพบพลังงานมหาศาล! สัญญาณชีพนี้มันอะไรกัน?!' },
  { speaker: 'boss', text: 'บังอาจนัก...เจ้ามนุษย์ผู้ต่ำต้อย เจ้ามาไกลเกินไปแล้ว' },
  { speaker: 'player', text: 'นี่คือ...สิ่งมีชีวิตงั้นเหรอ?! เตรียมระบบต่อสู้!' },
  { speaker: 'boss', text: 'จงสิ้นหวังซะต่อหน้าข้า... The Void Leviathan!' },
];

// New: Data for the Galactic Database
export const DATABASE_CATEGORIES: DatabaseCategory[] = [
    { id: 'stars', title: 'ดาวฤกษ์ (Stars)', description: 'วงจรชีวิต การกำเนิด และจุดจบของดวงดาว', icon: Star },
    { id: 'black_holes', title: 'หลุมดำ (Black Holes)', description: 'วัตถุปริศนาที่ดูดกลืนทุกสิ่งแม้กระทั่งแสง', icon: Orbit },
    { id: 'galaxies', title: 'กาแล็กซี (Galaxies)', description: 'อาณาจักรแห่งดวงดาวนับล้านล้านดวง', icon: Milestone },
    { id: 'nebulae', title: 'เนบิวลา (Nebulae)', description: 'กลุ่มก๊าซและฝุ่นอันสวยงาม แหล่งกำเนิดดวงดาว', icon: VenetianMask },
    { id: 'supernova', title: 'ซูเปอร์โนวา (Supernova)', description: 'การระเบิดครั้งสุดท้ายอันทรงพลังของดวงดาว', icon: Sparkles },
    { id: 'quasars', title: 'ควาซาร์ & พลังงานสูง', description: 'ปรากฏการณ์ที่สว่างและรุนแรงที่สุดในจักรวาล', icon: Zap },
    { id: 'other_objects', title: 'วัตถุอวกาศอื่นๆ', description: 'ดาวหาง ดาวเคราะห์น้อย และดินแดนอันไกลโพ้น', icon: Binary },
    { id: 'space_tech', title: 'เทคโนโลยีอวกาศ', description: 'ยานสำรวจ กล้องโทรทรรศน์ และจรวด', icon: Rocket },
    { id: 'space_travel', title: 'การเดินทางในอวกาศ', description: 'ชีวิตบนสถานีอวกาศและความท้าทาย', icon: Sprout },
    { id: 'cosmology', title: 'จักรวาลวิทยา (Cosmology)', description: 'กำเนิดและอนาคตของจักรวาล สสารมืด และพลังงานมืด', icon: Atom },
];