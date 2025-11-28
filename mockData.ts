import { ScanResult, DatabaseTopic, QuizQuestion } from './types';

// Reliable High-Quality Images (Switched to NASA/Wiki for accuracy)
const IMAGES = {
    SUN: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/1024px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",
    MERCURY: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg/1024px-Mercury_in_color_-_Prockter07-edit1.jpg",
    VENUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/1024px-Venus-real_color.jpg",
    EARTH: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1024px-The_Earth_seen_from_Apollo_17.jpg", // The Blue Marble
    MOON: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1024px-FullMoon2010.jpg",
    MARS: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg", // True color Mars
    JUPITER: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/1024px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg",
    SATURN: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1024px-Saturn_during_Equinox.jpg",
    TITAN: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Titan_in_true_color.jpg/1024px-Titan_in_true_color.jpg",
    URANUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1024px-Uranus2.jpg",
    NEPTUNE: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1024px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg",
    PLUTO: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/1024px-Pluto_in_True_Color_-_High-Res.jpg",
    BLACK_HOLE: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1024px-Black_hole_-_Messier_87_crop_max_res.jpg", // Real EHT Image
    GALAXY: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Andromeda_galaxy_2.jpg/1024px-Andromeda_galaxy_2.jpg", // Andromeda
    TRIANGULUM: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/M33_ESA_Hubble_Large.jpg/1024px-M33_ESA_Hubble_Large.jpg", // Triangulum
    NEBULA: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NGC7293_%282004%29.jpg/1024px-NGC7293_%282004%29.jpg", // Helix Nebula
    ORION: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/1024px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg",
    BETELGEUSE: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Betelgeuse_pulsing.jpg/640px-Betelgeuse_pulsing.jpg", // Artist concept or ALMA
    TON618: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Quasar_3C_273.jpg/800px-Quasar_3C_273.jpg", // Representative Quasar
    SUPERNOVA: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Keplers_supernova.jpg/1024px-Keplers_supernova.jpg",
    TECH: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Apollo_14_Shepard.jpg/1024px-Apollo_14_Shepard.jpg",
    COSMOLOGY: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/CMB_Timeline300_no_W_MAP.jpg/1024px-CMB_Timeline300_no_W_MAP.jpg",
    COMET: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Lspn_comet_halley.jpg/1024px-Lspn_comet_halley.jpg", // Halley 1986
    PROXIMA: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/New_Shot_of_Proxima_Centauri.jpg/1024px-New_Shot_of_Proxima_Centauri.jpg",
    SIRIUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Sirius_A_and_B_Hubble_photo.jpg/1024px-Sirius_A_and_B_Hubble_photo.jpg",
    UY_SCUTI: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/UY_Scuti_size_comparison_to_the_sun.png/1024px-UY_Scuti_size_comparison_to_the_sun.png",
    WHIRLPOOL: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Messier51_sRGB.jpg/1024px-Messier51_sRGB.jpg",
    CRAB: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1024px-Crab_Nebula.jpg",
    PILLARS: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pillars_of_creation_2014_Hubble_Black_Background.jpg/1024px-Pillars_of_creation_2014_Hubble_Black_Background.jpg",
    M87: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1024px-Black_hole_-_Messier_87_crop_max_res.jpg",
    C3273: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Quasar_3C_273.jpg/800px-Quasar_3C_273.jpg",
    // NEW
    SOMBRERO: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/M104_ngc4594_sombrero_galaxy_hi-res.jpg/1024px-M104_ngc4594_sombrero_galaxy_hi-res.jpg",
    CIGAR: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/M82_HST_ACS_2006-14-a-large_web.jpg/1024px-M82_HST_ACS_2006-14-a-large_web.jpg",
    CYGNUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Cygnus_X-1.jpg/800px-Cygnus_X-1.jpg", // Artist Impression
    RIGEL: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Rigel_blue_supergiant.jpg/800px-Rigel_blue_supergiant.jpg", // Artist Impression
    STEPHENSON: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Stephenson_2-18_size_comparison.jpg/1024px-Stephenson_2-18_size_comparison.jpg",
    VEGA: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Vega_Spitzer.jpg/800px-Vega_Spitzer.jpg",
    HELIX: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/NGC7293_%282004%29.jpg/1024px-NGC7293_%282004%29.jpg",
    HORSEHEAD: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Barnard_33.jpg/1024px-Barnard_33.jpg",
    ULAS: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Artist%E2%80%99s_impression_of_the_quasar_ULAS_J1120%2B0641.jpg/1024px-Artist%E2%80%99s_impression_of_the_quasar_ULAS_J1120%2B0641.jpg"
};

// Helper function to create quizzes
const createQ = (q: string, opts: string[], correct: number, exp: string): QuizQuestion => ({
    question: q, options: opts, correctAnswerIndex: correct, explanation: exp
});

const COMMON_SPACE_QUIZ: QuizQuestion[] = [
    createQ("ดาวเคราะห์ดวงใดใหญ่ที่สุด?", ["พฤหัส", "เสาร์", "โลก", "อังคาร"], 0, "Jupiter"),
    createQ("ระบบสุริยะมีดาวเคราะห์กี่ดวง?", ["8", "9", "7", "12"], 0, "พลูโตถูกตัดออก"),
    createQ("1 ปีแสง คือหน่วยวัดอะไร?", ["ระยะทาง", "เวลา", "ความสว่าง", "ความเร็ว"], 0, "ระยะที่แสงเดินทางใน 1 ปี"),
    createQ("ดาวเคราะห์สีน้ำเงินคือ?", ["โลก", "อังคาร", "ศุกร์", "พุธ"], 0, "โลกของเรา"),
    createQ("ดาวเคราะห์แดงคือ?", ["อังคาร", "พฤหัส", "เสาร์", "ศุกร์"], 0, "Mars"),
    createQ("หลุมดำเกิดจาก?", ["ดาวฤกษ์ตาย", "ดาวเคราะห์ระเบิด", "อุกกาบาต", "ดวงอาทิตย์ดับ"], 0, "Supernova ของดาวมวลมาก"),
    createQ("ดาวฤกษ์ที่ใกล้โลกที่สุด?", ["ดวงอาทิตย์", "Proxima Centauri", "Sirius", "Alpha Centauri"], 0, "Sun"),
    createQ("จักรวาลกำเนิดจาก?", ["Big Bang", "Big Crunch", "Big Rip", "Big Mac"], 0, "บิกแบง"),
    createQ("แสงเดินทางเร็วเท่าไหร่?", ["300,000 กม./วิ", "1,000 กม./ชม.", "เสียง", "รถเมล์"], 0, "เร็วที่สุดในจักรวาล")
];

const EARTH_QUIZ_POOL: QuizQuestion[] = [
    createQ("โลกเป็นดาวเคราะห์ลำดับที่เท่าไหร่จากดวงอาทิตย์?", ["1", "2", "3", "4"], 2, "ถัดจากดาวศุกร์"),
    createQ("โลกมีดวงจันทร์กี่ดวง?", ["1", "2", "3", "ไม่มี"], 0, "มีดวงเดียวชื่อ The Moon"),
    createQ("ก๊าซที่มีมากที่สุดในบรรยากาศโลกคือ?", ["ออกซิเจน", "ไนโตรเจน", "คาร์บอนไดออกไซด์", "อาร์กอน"], 1, "ไนโตรเจน 78%"),
    createQ("โลกหมุนรอบตัวเองใช้เวลาเท่าไหร่?", ["24 ชม.", "23 ชม. 56 นาที", "25 ชม.", "12 ชม."], 1, "เรียกว่า Sidereal Day"),
    createQ("โลกโคจรรอบดวงอาทิตย์ใช้เวลาเท่าไหร่?", ["365 วัน", "365.25 วัน", "360 วัน", "366 วัน"], 1, "จึงมีปีอธิกสุรทินทุก 4 ปี"),
    createQ("ส่วนประกอบหลักของแกนโลกชั้นในคือ?", ["หิน", "น้ำ", "เหล็กและนิกเกิล", "ทองคำ"], 2, "เป็นของแข็งที่มีความร้อนสูง"),
    createQ("ภูเขาที่สูงที่สุดบนโลก (วัดจากระดับน้ำทะเล) คือ?", ["K2", "Everest", "Fuji", "Kilimanjaro"], 1, "สูง 8,848 เมตร"),
    createQ("มหาสมุทรที่ใหญ่ที่สุดบนโลกคือ?", ["แอตแลนติก", "อินเดีย", "แปซิฟิก", "อาร์กติก"], 2, "ครอบคลุมพื้นที่ 1/3 ของโลก"),
    createQ("ผิวโลกส่วนใหญ่ปกคลุมด้วยอะไร?", ["ดิน", "ป่าไม้", "น้ำ", "ทราย"], 2, "น้ำ 71%"),
    createQ("จุดที่ลึกที่สุดในมหาสมุทรโลกเรียกว่า?", ["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"], 0, "ลึกกว่าความสูงของเอเวอเรสต์"),
];

const MARS_QUIZ_POOL: QuizQuestion[] = [
    createQ("ฉายาของดาวอังคารคือ?", ["Red Planet", "Blue Planet", "Rusty Star", "Death Star"], 0, "ดาวเคราะห์สีแดง"),
    createQ("ทำไมดาวอังคารเป็นสีแดง?", ["ลาวา", "สนิมเหล็ก (Iron Oxide)", "ไฟป่า", "สะท้อนแสงอาทิตย์"], 1, "พื้นผิวเต็มไปด้วยฝุ่นสนิม"),
    createQ("ดาวอังคารมีดวงจันทร์กี่ดวง?", ["1", "2", "4", "0"], 1, "Phobos และ Deimos"),
    createQ("ภูเขาที่สูงที่สุดในระบบสุริยะอยู่บนดาวอังคารชื่อ?", ["Everest", "Olympus Mons", "Fuji", "Maxwell"], 1, "สูง 21 กม. (3 เท่าของเอเวอเรสต์)"),
    createQ("บรรยากาศดาวอังคารประกอบด้วยก๊าซอะไรเป็นหลัก?", ["O2", "N2", "CO2", "Ar"], 2, "คาร์บอนไดออกไซด์ 95%"),
    createQ("แรงโน้มถ่วงบนดาวอังคารเป็นกี่ % ของโลก?", ["100%", "38%", "10%", "90%"], 1, "กระโดดได้สูงกว่าโลก"),
    createQ("น้ำบนดาวอังคารส่วนใหญ่อยู่ในสถานะใด?", ["ของเหลว", "ไอน้ำ", "น้ำแข็ง", "พลาสมา"], 2, "น้ำแข็งขั้วโลกและใต้ดิน"),
    createQ("ยานโรเวอร์ลำล่าสุดของ NASA (2021)?", ["Perseverance", "Curiosity", "Opportunity", "Spirit"], 0, "ค้นหาร่องรอยสิ่งมีชีวิต"),
    createQ("หนึ่งวันบนดาวอังคารเรียกว่า?", ["Day", "Sol", "Year", "Hour"], 1, "ยาว 24 ชม. 39 นาที"),
    createQ("ดาวอังคารเล็กหรือใหญ่กว่าโลก?", ["ใหญ่กว่า", "เล็กกว่า (ประมาณครึ่งหนึ่ง)", "เท่ากัน", "เล็กกว่ามาก"], 1, "เส้นผ่านศูนย์กลางครึ่งเดียว"),
];

// Combine generic quizzes for mapping
export const MOCK_QUIZZES: Record<string, QuizQuestion[]> = {
    "Mercury": [...COMMON_SPACE_QUIZ],
    "Venus": [...COMMON_SPACE_QUIZ],
    "Earth": EARTH_QUIZ_POOL,
    "Mars": MARS_QUIZ_POOL,
    "Jupiter": [...COMMON_SPACE_QUIZ],
    "Saturn": [...COMMON_SPACE_QUIZ],
    "Uranus": [...COMMON_SPACE_QUIZ],
    "Neptune": [...COMMON_SPACE_QUIZ],
    "Pluto": [...COMMON_SPACE_QUIZ],
    "Sun": [...COMMON_SPACE_QUIZ],
    "Moon": [...COMMON_SPACE_QUIZ],
    "Titan": [...COMMON_SPACE_QUIZ],
    "Sagittarius A*": [...COMMON_SPACE_QUIZ], 
    "Andromeda": [...COMMON_SPACE_QUIZ],
    "Triangulum": [...COMMON_SPACE_QUIZ],
    "Halleys Comet": [...COMMON_SPACE_QUIZ],
    "Betelgeuse": [...COMMON_SPACE_QUIZ],
    "Orion Nebula": [...COMMON_SPACE_QUIZ],
    "TON 618": [...COMMON_SPACE_QUIZ],
    "Proxima Centauri": [...COMMON_SPACE_QUIZ],
    "Sirius": [...COMMON_SPACE_QUIZ],
    "UY Scuti": [...COMMON_SPACE_QUIZ],
    "M87*": [...COMMON_SPACE_QUIZ],
    "Crab Nebula": [...COMMON_SPACE_QUIZ],
    "Whirlpool Galaxy": [...COMMON_SPACE_QUIZ],
    "Pillars of Creation": [...COMMON_SPACE_QUIZ],
    "3C 273": [...COMMON_SPACE_QUIZ],
    "Sombrero Galaxy": [...COMMON_SPACE_QUIZ],
    "Cigar Galaxy": [...COMMON_SPACE_QUIZ],
    "Cygnus X-1": [...COMMON_SPACE_QUIZ],
    "Rigel": [...COMMON_SPACE_QUIZ],
    "Stephenson 2-18": [...COMMON_SPACE_QUIZ],
    "Vega": [...COMMON_SPACE_QUIZ],
    "Helix Nebula": [...COMMON_SPACE_QUIZ],
    "Horsehead Nebula": [...COMMON_SPACE_QUIZ],
    "Keplers Supernova": [...COMMON_SPACE_QUIZ],
    "ULAS J1120+064": [...COMMON_SPACE_QUIZ]
};

// --- EXPANDED PLANET DATA ---
export const MOCK_PLANET_DATA: Record<string, ScanResult> = {
    "Sun": {
        planetName: "ดวงอาทิตย์",
        summary: "ศูนย์กลางแห่งระบบสุริยะ เป็นดาวฤกษ์ชนิด G2V ที่ประกอบด้วยไฮโดรเจนและฮีเลียมในสถานะพลาสมาที่ร้อนจัด พลังงานจากปฏิกิริยานิวเคลียร์ฟิวชันที่แกนกลางเดินทางนับแสนปีกว่าจะถึงพื้นผิวและส่องสว่างมายังโลก มันมีมวลถึง 99.86% ของมวลรวมทั้งระบบสุริยะ แรงโน้มถ่วงมหาศาลของมันคือสิ่งที่ยึดเหนี่ยวดาวเคราะห์ทุกดวงให้โคจรอยู่ได้ หากไม่มีดวงอาทิตย์ ระบบสุริยะของเราจะแตกสลายและโลกจะลอยเคว้งคว้างในอวกาศที่หนาวเหน็บ",
        temperature: "5,500°C (ผิว) / 15 ล้าน°C (แกน)",
        gravity: "274 m/s² (28G - หนักกว่าโลก 28 เท่า)",
        funFact: "รู้หรือไม่? ดวงอาทิตย์เผาผลาญไฮโดรเจนถึง 600 ล้านตันในทุกๆ วินาที และแสงที่คุณเห็นตอนนี้ จริงๆ แล้วเดินทางออกจากดวงอาทิตย์มาเมื่อ 8 นาที 20 วินาทีที่แล้ว",
        orbitPeriod: "230 ล้านปี (โคจรรอบกาแล็กซี)",
        rotationPeriod: "25-35 วัน (หมุนไม่พร้อมกัน)",
        distanceFromEarth: "149.6 ล้าน กม. (1 AU)",
        moons: "0 (แต่มีบริวารเป็นดาวเคราะห์ 8 ดวง)",
        atmosphere: "ชั้นโคโรนา (Corona)",
        potentialForLife: "เป็นไปไม่ได้อย่างสิ้นเชิง",
        structure: "พลาสมา (Plasma)",
        imageUrl: IMAGES.SUN
    },
    "Mercury": {
        planetName: "ดาวพุธ",
        summary: "ดาวเคราะห์ที่อยู่ใกล้ดวงอาทิตย์ที่สุดและเล็กที่สุดในระบบสุริยะ ไม่มีชั้นบรรยากาศห่อหุ้มทำให้อุณหภูมิพื้นผิวแตกต่างกันมากระหว่างกลางวันและกลางคืน พื้นผิวเต็มไปด้วยหลุมอุกกาบาตคล้ายดวงจันทร์",
        temperature: "430°C (กลางวัน) / -180°C (กลางคืน)",
        gravity: "3.7 m/s²",
        funFact: "หนึ่งวันบนดาวพุธยาวนานกว่าหนึ่งปีของมัน! (หมุนรอบตัวเองช้ามากเมื่อเทียบกับการโคจร)",
        orbitPeriod: "88 วัน",
        rotationPeriod: "59 วัน",
        distanceFromEarth: "77 ล้าน กม.",
        moons: "0",
        atmosphere: "เบาบางมาก (Exosphere)",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "ดาวเคราะห์หิน",
        imageUrl: IMAGES.MERCURY
    },
    "Venus": {
        planetName: "ดาวศุกร์",
        summary: "ดาวฝาแฝดของโลกที่มีขนาดใกล้เคียงกันแต่สภาพแวดล้อมต่างกันราวนรก มีชั้นบรรยากาศหนาทึบด้วยคาร์บอนไดออกไซด์ทำให้เกิดปรากฏการณ์เรือนกระจกแบบกู่ไม่กลับ ร้อนที่สุดในระบบสุริยะ",
        temperature: "462°C",
        gravity: "8.87 m/s²",
        funFact: "ดาวศุกร์หมุนรอบตัวเองในทิศตรงข้ามกับดาวเคราะห์ส่วนใหญ่ ดวงอาทิตย์ขึ้นทางทิศตะวันตกและตกทางทิศตะวันออก",
        orbitPeriod: "225 วัน",
        rotationPeriod: "243 วัน",
        distanceFromEarth: "41 ล้าน กม.",
        moons: "0",
        atmosphere: "หนาทึบ (CO2, กรดซัลฟิวริก)",
        potentialForLife: "เป็นไปได้ยาก (อาจมีในชั้นบรรยากาศ)",
        structure: "ดาวเคราะห์หิน",
        imageUrl: IMAGES.VENUS
    },
    "Earth": {
        planetName: "โลก",
        summary: "บ้านของเรา ดาวเคราะห์เพียงดวงเดียวในจักรวาลที่ทราบว่ามีสิ่งมีชีวิต มีน้ำในสถานะของเหลวปกคลุมพื้นผิว 71% และมีบรรยากาศที่อุดมด้วยออกซิเจนและไนโตรเจน",
        temperature: "เฉลี่ย 15°C",
        gravity: "9.8 m/s² (1G)",
        funFact: "โลกไม่ใช่ทรงกลมสมบูรณ์ แต่แป้นเล็กน้อยที่ขั้วเนื่องจากการหมุนรอบตัวเอง",
        orbitPeriod: "365.25 วัน",
        rotationPeriod: "24 ชั่วโมง",
        distanceFromEarth: "0",
        moons: "1 (ดวงจันทร์)",
        atmosphere: "ไนโตรเจน, ออกซิเจน",
        potentialForLife: "ยืนยันแล้ว",
        structure: "ดาวเคราะห์หิน",
        imageUrl: IMAGES.EARTH
    },
    "Moon": {
        planetName: "ดวงจันทร์",
        summary: "บริวารดวงเดียวของโลกและเป็นวัตถุท้องฟ้าที่สว่างที่สุดเป็นอันดับสองบนท้องฟ้ายามค่ำคืน เกิดจากการชนครั้งใหญ่ในอดีต มีอิทธิพลต่อน้ำขึ้นน้ำลงบนโลก",
        temperature: "127°C (กลางวัน) / -173°C (กลางคืน)",
        gravity: "1.62 m/s² (1/6 ของโลก)",
        funFact: "เราเห็นดวงจันทร์เพียงด้านเดียวเสมอเพราะมันหมุนรอบตัวเองใช้เวลาเท่ากับที่โคจรรอบโลก (Tidal Locking)",
        orbitPeriod: "27.3 วัน",
        rotationPeriod: "27.3 วัน",
        distanceFromEarth: "384,400 กม.",
        moons: "0",
        atmosphere: "ไม่มี",
        potentialForLife: "ไม่มี",
        structure: "หิน",
        imageUrl: IMAGES.MOON
    },
    "Mars": {
        planetName: "ดาวอังคาร",
        summary: "ดาวเคราะห์สีแดงที่เต็มไปด้วยสนิมเหล็ก มีภูเขาไฟที่สูงที่สุดและหุบเหวที่ลึกที่สุดในระบบสุริยะ เป็นเป้าหมายหลักในการค้นหาสิ่งมีชีวิตนอกโลกและการตั้งถิ่นฐานในอนาคต",
        temperature: "-63°C",
        gravity: "3.71 m/s²",
        funFact: "มีภูเขาไฟ Olympus Mons สูงกว่ายอดเขาเอเวอเรสต์ถึง 3 เท่า",
        orbitPeriod: "687 วัน",
        rotationPeriod: "24.6 ชั่วโมง",
        distanceFromEarth: "78 ล้าน กม.",
        moons: "2 (Phobos, Deimos)",
        atmosphere: "บาง (CO2)",
        potentialForLife: "อาจมีจุลชีพในอดีต",
        structure: "ดาวเคราะห์หิน",
        imageUrl: IMAGES.MARS
    },
    "Jupiter": {
        planetName: "ดาวพฤหัสบดี",
        summary: "พี่ใหญ่แห่งระบบสุริยะ เป็นดาวเคราะห์ก๊าซยักษ์ที่มีมวลมากกว่าดาวเคราะห์ดวงอื่นรวมกันถึง 2.5 เท่า มีพายุหมุนขนาดใหญ่ที่เรียกว่าจุดแดงใหญ่ (Great Red Spot)",
        temperature: "-108°C",
        gravity: "24.79 m/s²",
        funFact: "ทำหน้าที่เหมือน 'เครื่องดูดฝุ่น' ของระบบสุริยะ ช่วยดูดซับหรือเบี่ยงเบนอุกกาบาตไม่ให้พุ่งชนโลก",
        orbitPeriod: "11.9 ปี",
        rotationPeriod: "10 ชั่วโมง",
        distanceFromEarth: "628 ล้าน กม.",
        moons: "95 (ที่ยืนยันแล้ว)",
        atmosphere: "ไฮโดรเจน, ฮีเลียม",
        potentialForLife: "เป็นไปไม่ได้ (แต่อาจมีที่ดวงจันทร์บริวาร)",
        structure: "ก๊าซยักษ์",
        imageUrl: IMAGES.JUPITER
    },
    "Saturn": {
        planetName: "ดาวเสาร์",
        summary: "ราชินีแห่งวงแหวน ดาวเคราะห์ที่สวยงามที่สุดด้วยระบบวงแหวนขนาดใหญ่ที่ประกอบด้วยน้ำแข็งและฝุ่น เป็นดาวเคราะห์ที่มีความหนาแน่นน้อยที่สุด (ลอยน้ำได้)",
        temperature: "-139°C",
        gravity: "10.44 m/s²",
        funFact: "วงแหวนของดาวเสาร์กว้างมากแต่บางมาก มีความหนาเฉลี่ยเพียง 10 เมตร",
        orbitPeriod: "29.5 ปี",
        rotationPeriod: "10.7 ชั่วโมง",
        distanceFromEarth: "1.2 พันล้าน กม.",
        moons: "146",
        atmosphere: "ไฮโดรเจน, ฮีเลียม",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "ก๊าซยักษ์",
        imageUrl: IMAGES.SATURN
    },
    "Titan": {
        planetName: "ไททัน",
        summary: "ดวงจันทร์ที่ใหญ่ที่สุดของดาวเสาร์และใหญ่กว่าดาวพุธ เป็นดวงจันทร์ดวงเดียวที่มีชั้นบรรยากาศหนาแน่นและมีทะเลสาบมีเทนเหลวบนพื้นผิว",
        temperature: "-179°C",
        gravity: "1.35 m/s²",
        funFact: "ถ้าคุณมีปีก คุณสามารถบินบนไททันได้เหมือนนก เพราะแรงโน้มถ่วงต่ำและบรรยากาศหนาแน่น",
        orbitPeriod: "16 วัน (รอบดาวเสาร์)",
        rotationPeriod: "16 วัน",
        distanceFromEarth: "1.2 พันล้าน กม.",
        moons: "0",
        atmosphere: "ไนโตรเจนหนาแน่น",
        potentialForLife: "อาจมีสิ่งมีชีวิตแบบมีเทน",
        structure: "น้ำแข็งและหิน",
        imageUrl: IMAGES.TITAN
    },
    "Uranus": {
        planetName: "ดาวยูเรนัส",
        summary: "ดาวยักษ์น้ำแข็งสีฟ้าเขียวที่แปลกประหลาด เพราะแกนหมุนของมันเอียงเกือบขนานกับระนาบการโคจร ทำให้มัน 'กลิ้ง' ไปรอบดวงอาทิตย์",
        temperature: "-197°C",
        gravity: "8.69 m/s²",
        funFact: "เป็นดาวเคราะห์ดวงแรกที่ถูกค้นพบโดยใช้กล้องโทรทรรศน์",
        orbitPeriod: "84 ปี",
        rotationPeriod: "17 ชั่วโมง",
        distanceFromEarth: "2.6 พันล้าน กม.",
        moons: "27",
        atmosphere: "ไฮโดรเจน, ฮีเลียม, มีเทน",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "ยักษ์น้ำแข็ง",
        imageUrl: IMAGES.URANUS
    },
    "Neptune": {
        planetName: "ดาวเนปจูน",
        summary: "ดาวยักษ์น้ำแข็งสีน้ำเงินเข้มที่อยู่ไกลที่สุด มีลมพายุที่รุนแรงที่สุดในระบบสุริยะ ด้วยความเร็วลมสูงถึง 2,100 กม./ชม.",
        temperature: "-201°C",
        gravity: "11.15 m/s²",
        funFact: "ถูกค้นพบจากการคำนวณทางคณิตศาสตร์ก่อนที่จะถูกสังเกตเห็นด้วยกล้องโทรทรรศน์",
        orbitPeriod: "165 ปี",
        rotationPeriod: "16 ชั่วโมง",
        distanceFromEarth: "4.3 พันล้าน กม.",
        moons: "14",
        atmosphere: "ไฮโดรเจน, ฮีเลียม, มีเทน",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "ยักษ์น้ำแข็ง",
        imageUrl: IMAGES.NEPTUNE
    },
    "Pluto": {
        planetName: "ดาวพลูโต",
        summary: "อดีตดาวเคราะห์ดวงที่ 9 ปัจจุบันถูกจัดเป็นดาวเคราะห์แคระ อยู่ในแถบไคเปอร์ พื้นผิวเป็นน้ำแข็งไนโตรเจนและมีภูเขาน้ำแข็ง",
        temperature: "-229°C",
        gravity: "0.62 m/s²",
        funFact: "มีบรรยากาศสีฟ้าจางๆ และหิมะสีแดง",
        orbitPeriod: "248 ปี",
        rotationPeriod: "6.4 วัน",
        distanceFromEarth: "5.9 พันล้าน กม.",
        moons: "5",
        atmosphere: "ไนโตรเจน, มีเทน",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "น้ำแข็งและหิน",
        imageUrl: IMAGES.PLUTO
    },
    "Sagittarius A*": {
        planetName: "Sagittarius A*",
        summary: "หลุมดำมวลยิ่งยวด (Supermassive Black Hole) ที่ใจกลางกาแล็กซีทางช้างเผือก มีมวลมากกว่าดวงอาทิตย์ 4 ล้านเท่า",
        temperature: "N/A",
        gravity: "อนันต์",
        funFact: "ดาวฤกษ์ S2 โคจรรอบมันด้วยความเร็วสูงถึง 7,650 กม./วินาที (2.55% ของความเร็วแสง)",
        orbitPeriod: "0",
        rotationPeriod: "หมุนเร็วมาก",
        distanceFromEarth: "26,000 ปีแสง",
        moons: "0",
        atmosphere: "N/A",
        potentialForLife: "N/A",
        structure: "Singularity",
        imageUrl: IMAGES.BLACK_HOLE
    },
    "Andromeda": {
        planetName: "แอนดรอเมดา",
        summary: "กาแล็กซีเพื่อนบ้านขนาดใหญ่ที่ใกล้เราที่สุด กำลังพุ่งเข้าชนทางช้างเผือกและจะรวมตัวกันในอีก 4.5 พันล้านปีข้างหน้า",
        temperature: "N/A",
        gravity: "N/A",
        funFact: "วัตถุที่ไกลที่สุดที่มองเห็นได้ด้วยตาเปล่า",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "2.5 ล้านปีแสง",
        moons: "N/A",
        atmosphere: "N/A",
        potentialForLife: "สูง (มีดาวฤกษ์ล้านล้านดวง)",
        structure: "Spiral Galaxy",
        imageUrl: IMAGES.GALAXY
    },
    "Triangulum": {
        planetName: "Triangulum (M33)",
        summary: "กาแล็กซีขนาดเล็กในกลุ่มท้องถิ่น (Local Group) เป็นลูกน้องของแอนดรอเมดา อาจมีดาวฤกษ์ 4 หมื่นล้านดวง",
        temperature: "N/A",
        gravity: "N/A",
        funFact: "เป็นกาแล็กซีที่ไม่มีหลุมดำมวลยิ่งยวดที่ใจกลาง (หรือมีขนาดเล็กมาก)",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "3 ล้านปีแสง",
        moons: "N/A",
        atmosphere: "N/A",
        potentialForLife: "เป็นไปได้",
        structure: "Spiral Galaxy",
        imageUrl: IMAGES.TRIANGULUM
    },
    "Halleys Comet": {
        planetName: "ดาวหางฮัลเลย์",
        summary: "ดาวหางคาบสั้นที่มีชื่อเสียงที่สุด จะโคจรกลับมาให้เห็นทุกๆ 75-76 ปี ครั้งต่อไปจะมาในปี 2061",
        temperature: "ระเหิดเมื่อใกล้ดวงอาทิตย์",
        gravity: "ต่ำมาก",
        funFact: "เป็นดาวหางดวงแรกที่ถูกพิสูจน์ว่าเป็นดวงเดิมที่กลับมาเยือน",
        orbitPeriod: "75 ปี",
        rotationPeriod: "2.2 วัน",
        distanceFromEarth: "แปรผัน",
        moons: "0",
        atmosphere: "Coma (ชั่วคราว)",
        potentialForLife: "มีสารอินทรีย์",
        structure: "ก้อนน้ำแข็งสกปรก",
        imageUrl: IMAGES.COMET
    },
    "Betelgeuse": {
        planetName: "บีเทลจุส",
        summary: "ดาวยักษ์แดงในกลุ่มดาวนายพราน ใกล้จะจบชีวิตและระเบิดเป็นซูเปอร์โนวา ซึ่งเมื่อระเบิดจะสว่างเท่าดวงจันทร์เต็มดวง",
        temperature: "3,300°C",
        gravity: "ต่ำ",
        funFact: "ถ้าอยู่ที่ตำแหน่งดวงอาทิตย์ ผิวของมันจะกินพื้นที่ไปถึงดาวพฤหัสบดี",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "640 ปีแสง",
        moons: "0",
        atmosphere: "ก๊าซขยายตัว",
        potentialForLife: "N/A",
        structure: "Red Supergiant",
        imageUrl: IMAGES.BETELGEUSE
    },
    "Orion Nebula": {
        planetName: "เนบิวลานายพราน",
        summary: "โรงงานผลิตดาวฤกษ์ที่ใกล้โลกที่สุด มองเห็นได้ด้วยตาเปล่าเป็นจุดมัวๆ ที่ดาบนายพราน",
        temperature: "10,000°C",
        gravity: "N/A",
        funFact: "มีระบบดาวที่กำลังก่อตัวพร้อมจานฝุ่น (Protoplanetary Disks) มากมาย",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "1,344 ปีแสง",
        moons: "N/A",
        atmosphere: "ก๊าซและฝุ่น",
        potentialForLife: "N/A",
        structure: "Nebula",
        imageUrl: IMAGES.ORION
    },
    "TON 618": {
        planetName: "TON 618",
        summary: "หลุมดำที่ใหญ่ที่สุดเท่าที่เคยค้นพบ (Ultramassive Black Hole) มีมวล 66,000 ล้านเท่าของดวงอาทิตย์",
        temperature: "N/A",
        gravity: "อนันต์",
        funFact: "ใหญ่กว่าระบบสุริยะของเราหลายเท่า แสงจากจานพอกพูนมวลสว่างกว่าดวงอาทิตย์ 140 ล้านล้านเท่า",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "10.4 พันล้านปีแสง",
        moons: "N/A",
        atmosphere: "Accretion Disk",
        potentialForLife: "N/A",
        structure: "Quasar",
        imageUrl: IMAGES.TON618
    },
    "Proxima Centauri": {
        planetName: "พร็อกซิมา เซนทอรี",
        summary: "ดาวฤกษ์ที่อยู่ใกล้ระบบสุริยะที่สุด เป็นดาวแคระแดงที่มีดาวเคราะห์ (Proxima b) อยู่ในเขตที่เอื้อต่อสิ่งมีชีวิต",
        temperature: "2,700°C",
        gravity: "สูงกว่าดวงอาทิตย์ (ความหนาแน่น)",
        funFact: "แม้จะใกล้ที่สุด แต่ก็มองไม่เห็นด้วยตาเปล่าเพราะแสงจางมาก",
        orbitPeriod: "N/A",
        rotationPeriod: "83 วัน",
        distanceFromEarth: "4.24 ปีแสง",
        moons: "มีดาวเคราะห์ 2 ดวง",
        atmosphere: "Plasma",
        potentialForLife: "ที่ดาวเคราะห์บริวาร",
        structure: "Red Dwarf",
        imageUrl: IMAGES.PROXIMA
    },
    "Sirius": {
        planetName: "ซิริอุส",
        summary: "ดาวฤกษ์ที่สว่างที่สุดบนท้องฟ้ายามค่ำคืน (ไม่นับดาวเคราะห์) จริงๆ แล้วเป็นระบบดาวคู่ (Sirius A และ B)",
        temperature: "9,940°C",
        gravity: "N/A",
        funFact: "ชาวอียิปต์โบราณใช้การขึ้นของดาวซิริอุสเพื่อทำนายน้ำท่วมแม่น้ำไนล์",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "8.6 ปีแสง",
        moons: "0",
        atmosphere: "ไฮโดรเจน",
        potentialForLife: "ต่ำ",
        structure: "A-type Star",
        imageUrl: IMAGES.SIRIUS
    },
    "UY Scuti": {
        planetName: "UY Scuti",
        summary: "หนึ่งในดาวฤกษ์ที่ใหญ่ที่สุดเท่าที่รู้จัก ถ้านำมาวางแทนดวงอาทิตย์ ผิวของมันจะเลยวงโคจรของดาวพฤหัสบดี",
        temperature: "3,000°C",
        gravity: "ต่ำมากที่ผิว",
        funFact: "ต้องใช้เวลา 7 ชั่วโมงในการบินรอบมันด้วยความเร็วแสง (เทียบกับดวงอาทิตย์ 14.5 วินาที)",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "9,500 ปีแสง",
        moons: "0",
        atmosphere: "ก๊าซ",
        potentialForLife: "N/A",
        structure: "Red Hypergiant",
        imageUrl: IMAGES.UY_SCUTI
    },
    "M87*": {
        planetName: "M87*",
        summary: "หลุมดำมวลยิ่งยวดใจกลางกาแล็กซี M87 เป็นหลุมดำแรกที่มนุษย์ถ่ายภาพได้ (Event Horizon Telescope)",
        temperature: "N/A",
        gravity: "อนันต์",
        funFact: "มีเจ็ทพลาสมายาว 5,000 ปีแสงพุ่งออกมาจากใจกลาง",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "53 ล้านปีแสง",
        moons: "0",
        atmosphere: "N/A",
        potentialForLife: "N/A",
        structure: "Black Hole",
        imageUrl: IMAGES.M87
    },
    "Crab Nebula": {
        planetName: "เนบิวลาปู",
        summary: "ซากซูเปอร์โนวาที่ระเบิดในปี ค.ศ. 1054 มีดาวนิวตรอน (Pulsar) หมุนเร็วอยู่ที่ใจกลาง",
        temperature: "สูงมาก",
        gravity: "สูงมาก (ที่ Pulsar)",
        funFact: "พัลซาร์ใจกลางหมุน 30 รอบต่อวินาที!",
        orbitPeriod: "N/A",
        rotationPeriod: "33 มิลลิวินาที",
        distanceFromEarth: "6,500 ปีแสง",
        moons: "0",
        atmosphere: "ก๊าซ",
        potentialForLife: "N/A",
        structure: "Supernova Remnant",
        imageUrl: IMAGES.CRAB
    },
    "Whirlpool Galaxy": {
        planetName: "กาแล็กซีน้ำวน (M51)",
        summary: "กาแล็กซีกังหันที่หันหน้าเข้าหาโลกอย่างสมบูรณ์แบบ กำลังดูดกลืนกาแล็กซีแคระข้างเคียง",
        temperature: "N/A",
        gravity: "N/A",
        funFact: "โครงสร้างแขนกังหันที่ชัดเจนช่วยให้นักดาราศาสตร์เข้าใจโครงสร้างกาแล็กซี",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "23 ล้านปีแสง",
        moons: "N/A",
        atmosphere: "N/A",
        potentialForLife: "สูง",
        structure: "Spiral Galaxy",
        imageUrl: IMAGES.WHIRLPOOL
    },
    "Pillars of Creation": {
        planetName: "เสาแห่งการก่อกำเนิด",
        summary: "ส่วนหนึ่งของเนบิวลานกอินทรี (Eagle Nebula) เป็นแท่งก๊าซและฝุ่นยักษ์ที่เป็นแหล่งกำเนิดดาวฤกษ์ใหม่",
        temperature: "เย็น",
        gravity: "N/A",
        funFact: "ภาพจากกล้องฮับเบิลทำให้มันเป็นหนึ่งในภาพดาราศาสตร์ที่โด่งดังที่สุด",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "7,000 ปีแสง",
        moons: "N/A",
        atmosphere: "ฝุ่น",
        potentialForLife: "N/A",
        structure: "Nebula",
        imageUrl: IMAGES.PILLARS
    },
    "3C 273": {
        planetName: "3C 273",
        summary: "ควาซาร์แห่งแรกที่ถูกระบุตัวตน สว่างมากจนมองเห็นได้ด้วยกล้องโทรทรรศน์สมัครเล่นแม้จะอยู่ไกลมาก",
        temperature: "สูงมาก",
        gravity: "อนันต์",
        funFact: "สว่างกว่าดวงอาทิตย์ 4 ล้านล้านเท่า",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "2.4 พันล้านปีแสง",
        moons: "0",
        atmosphere: "Accretion Disk",
        potentialForLife: "N/A",
        structure: "Quasar",
        imageUrl: IMAGES.C3273
    },
    // New Data added correctly
    "Sombrero Galaxy": {
        planetName: "กาแล็กซีหมวกปีก",
        summary: "กาแล็กซี M104 หรือ Sombrero Galaxy มีลักษณะโดดเด่นเหมือนหมวกปีกกว้างชาวเม็กซิกัน เนื่องจากมีระนาบฝุ่นหนาทึบพาดผ่านใจกลางที่สว่างจ้า เป็นกาแล็กซีที่มีมวลมหาศาลและหลุมดำใจกลางที่หนักมาก",
        temperature: "N/A",
        gravity: "มหาศาล",
        funFact: "มันอยู่กึ่งกลางระหว่างกาแล็กซีกังหันและกาแล็กซีรี ทำให้เป็นวัตถุที่น่าสนใจสำหรับการศึกษาวิวัฒนาการกาแล็กซี",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "29 ล้านปีแสง",
        moons: "N/A",
        atmosphere: "N/A",
        potentialForLife: "สูงในระบบดาว",
        structure: "Galaxy",
        imageUrl: IMAGES.SOMBRERO
    },
    "Cigar Galaxy": {
        planetName: "กาแล็กซีซิการ์",
        summary: "M82 หรือ Cigar Galaxy เป็นกาแล็กซีที่มีการก่อตัวของดาวฤกษ์อย่างรุนแรง (Starburst Galaxy) รุนแรงกว่าทางช้างเผือกถึง 10 เท่า! ทำให้มันสว่างกว่าทางช้างเผือกถึง 5 เท่า",
        temperature: "N/A",
        gravity: "มหาศาล",
        funFact: "รูปทรงซิการ์เกิดจากแรงดึงดูดของกาแล็กซีข้างเคียง (M81) ที่บิดเบือนโครงสร้างของมัน",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "12 ล้านปีแสง",
        moons: "N/A",
        atmosphere: "N/A",
        potentialForLife: "เป็นไปได้",
        structure: "Starburst Galaxy",
        imageUrl: IMAGES.CIGAR
    },
    "Cygnus X-1": {
        planetName: "Cygnus X-1",
        summary: "แหล่งกำเนิดรังสีเอกซ์ที่โด่งดังที่สุดบนท้องฟ้า และเป็นวัตถุแรกที่ได้รับการยอมรับอย่างกว้างขวางว่าเป็นหลุมดำ มันโคจรรอบดาวฤกษ์คู่ขนาดยักษ์สีน้ำเงินและค่อยๆ ดูดกลืนก๊าซจากดาวคู่ของมัน",
        temperature: "ล้านองศา (Accretion)",
        gravity: "อนันต์",
        funFact: "Stephen Hawking เคยพนันกับ Kip Thorne ว่า Cygnus X-1 ไม่ใช่หลุมดำ แต่สุดท้ายเขาก็ยอมแพ้ในปี 1990",
        orbitPeriod: "5.6 วัน",
        rotationPeriod: "N/A",
        distanceFromEarth: "6,100 ปีแสง",
        moons: "0",
        atmosphere: "N/A",
        potentialForLife: "N/A",
        structure: "Stellar Black Hole",
        imageUrl: IMAGES.CYGNUS
    },
    "Rigel": {
        planetName: "ดาวไรเจล",
        summary: "ดาวฤกษ์ที่สว่างที่สุดในกลุ่มดาวนายพราน (ขาซ้ายนายพราน) เป็นดาวตายักษ์สีน้ำเงิน (Blue Supergiant) ที่มีพลังงานมหาศาล สว่างกว่าดวงอาทิตย์ถึง 120,000 เท่า!",
        temperature: "12,100°C",
        gravity: "N/A",
        funFact: "ถ้าเอาไรเจลมาแทนที่ดวงอาทิตย์ โลกจะถูกเผาจนระเหยไปในทันทีเพราะความร้อนและรังสี UV ที่รุนแรง",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "860 ปีแสง",
        moons: "0",
        atmosphere: "ไฮโดรเจน",
        potentialForLife: "เป็นไปไม่ได้",
        structure: "Blue Supergiant",
        imageUrl: IMAGES.RIGEL
    },
    "Stephenson 2-18": {
        planetName: "Stephenson 2-18",
        summary: "เจ้าของตำแหน่งดาวฤกษ์ที่ 'ใหญ่ที่สุด' เท่าที่เรารู้จักในปัจจุบัน (ใหญ่กว่า UY Scuti) รัศมีของมันกว้างกว่าดวงอาทิตย์ 2,150 เท่า! ถ้าวางไว้ตรงกลางระบบสุริยะ มันจะกินพื้นที่ไปจนถึงดาวเสาร์",
        temperature: "3,200°C",
        gravity: "ต่ำมาก",
        funFact: "แสงต้องใช้เวลาเกือบ 9 ชั่วโมงในการเดินทางรอบเส้นรอบวงของดาวดวงนี้ (เทียบกับดวงอาทิตย์แค่ 14.5 วินาที)",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "20,000 ปีแสง",
        moons: "0",
        atmosphere: "ก๊าซขยายตัว",
        potentialForLife: "N/A",
        structure: "Red Hypergiant",
        imageUrl: IMAGES.STEPHENSON
    },
    "Vega": {
        planetName: "ดาวเวกา",
        summary: "ดาวฤกษ์สีขาวสว่างสดใสในกลุ่มดาวพิณ (Lyra) เคยเป็นดาวเหนือของโลกเมื่อ 12,000 ปีก่อนและจะเป็นอีกครั้งในอนาคต เป็นดาวที่มีการหมุนรอบตัวเองเร็วมากจนตัวดาวป่องออกที่เส้นศูนย์สูตร",
        temperature: "9,600°C",
        gravity: "N/A",
        funFact: "เวกาเป็นดาวดวงแรกที่ถูกถ่ายภาพ (นอกจากดวงอาทิตย์) และเป็นดาวอ้างอิงสำหรับค่าความสว่าง (Magnitude 0)",
        orbitPeriod: "N/A",
        rotationPeriod: "12.5 ชั่วโมง",
        distanceFromEarth: "25 ปีแสง",
        moons: "มีวงแหวนฝุ่น",
        atmosphere: "ไฮโดรเจน",
        potentialForLife: "น้อย (อายุยังน้อย)",
        structure: "A-type Star",
        imageUrl: IMAGES.VEGA
    },
    "Helix Nebula": {
        planetName: "เนบิวลาตาเทพเจ้า",
        summary: "เนบิวลาดาวเคราะห์ที่อยู่ใกล้โลกที่สุดแห่งหนึ่ง รูปร่างเหมือนดวงตามนุษย์ขนาดขนาดยักษ์จ้องมองมาที่โลก เกิดจากดาวฤกษ์คล้ายดวงอาทิตย์ที่สิ้นอายุขัยและพ่นเปลือกก๊าซออกไป",
        temperature: "120,000°C (White Dwarf)",
        gravity: "N/A",
        funFact: "นี่คือภาพอนาคตของดวงอาทิตย์เราในอีก 5 พันล้านปีข้างหน้า ที่จะจบชีวิตลงอย่างสวยงามแบบนี้",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "650 ปีแสง",
        moons: "N/A",
        atmosphere: "ก๊าซเรืองแสง",
        potentialForLife: "N/A",
        structure: "Planetary Nebula",
        imageUrl: IMAGES.HELIX
    },
    "Horsehead Nebula": {
        planetName: "เนบิวลาหัวม้า",
        summary: "เนบิวลามืด (Dark Nebula) ที่มีรูปร่างเหมือนหัวม้าอย่างชัดเจน ตัดกับฉากหลังที่เป็นก๊าซสีแดงสว่าง เป็นแหล่งอนุบาลดาวฤกษ์ที่มีชื่อเสียงที่สุดแห่งหนึ่ง",
        temperature: "เย็นจัด",
        gravity: "N/A",
        funFact: "ส่วนที่เป็นหัวม้าจริงๆ แล้วคือก้อนฝุ่นหนาทึบที่กำลังถูกกัดเซาะโดยรังสีจากดาวฤกษ์ข้างเคียง",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "1,500 ปีแสง",
        moons: "N/A",
        atmosphere: "ฝุ่นหนาทึบ",
        potentialForLife: "สร้างดาวใหม่",
        structure: "Dark Nebula",
        imageUrl: IMAGES.HORSEHEAD
    },
    "Keplers Supernova": {
        planetName: "SN 1604",
        summary: "ซูเปอร์โนวาครั้งล่าสุดที่เกิดขึ้นในกาแล็กซีทางช้างเผือกของเราและมองเห็นได้ด้วยตาเปล่า ค้นพบโดย Johannes Kepler ในปี 1604 ปัจจุบันเป็นซากก๊าซที่ขยายตัวอย่างรวดเร็ว",
        temperature: "สูงมาก",
        gravity: "N/A",
        funFact: "ตอนที่ระเบิดใหม่ๆ มันสว่างกว่าดาวทุกดวงบนท้องฟ้าและมองเห็นได้แม้ในเวลากลางวัน",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "20,000 ปีแสง",
        moons: "N/A",
        atmosphere: "ซากระเบิด",
        potentialForLife: "N/A",
        structure: "Supernova Remnant",
        imageUrl: IMAGES.SUPERNOVA
    },
    "ULAS J1120+064": {
        planetName: "ULAS J1120+064",
        summary: "หนึ่งในควาซาร์ที่ไกลที่สุดเท่าที่เคยค้นพบ แสงของมันใช้เวลาเดินทางถึง 12.9 พันล้านปีกว่าจะถึงเรา นั่นหมายความว่าเรากำลังมองเห็นมันในช่วงที่จักรวาลเพิ่งถือกำเนิดได้ไม่นาน",
        temperature: "พันล้านองศา",
        gravity: "อนันต์",
        funFact: "การมีอยู่ของหลุมดำมวลมหาศาลขนาดนี้ในช่วงต้นกำเนิดจักรวาลยังคงเป็นปริศนาที่ท้าทายทฤษฎีการก่อตัวของหลุมดำในปัจจุบัน",
        orbitPeriod: "N/A",
        rotationPeriod: "N/A",
        distanceFromEarth: "29 พันล้านปีแสง (Comoving)",
        moons: "0",
        atmosphere: "Accretion Disk",
        potentialForLife: "N/A",
        structure: "High-Redshift Quasar",
        imageUrl: IMAGES.ULAS
    }
};

export const MOCK_DATABASE_DATA: Record<string, DatabaseTopic> = {
    "stars": {
        title: "ดาวฤกษ์ (Stars)",
        content: "ดาวฤกษ์คือวัตถุท้องฟ้าที่เป็นก้อนพลาสมาสว่างขนาดใหญ่ที่คงอยู่ได้ด้วยแรงโน้มถ่วงของตัวเอง ดาวฤกษ์ที่อยู่ใกล้โลกมากที่สุดคือ ดวงอาทิตย์ ซึ่งเป็นแหล่งพลังงานหลักของโลก",
        imageUrl: IMAGES.SUN,
        sections: [
            {
                title: "การกำเนิด (Birth)",
                content: "ดาวฤกษ์ถือกำเนิดขึ้นภายในเมฆโมเลกุล (Molecular Cloud) หรือเนบิวลา เมื่อแรงโน้มถ่วงทำให้ฝุ่นและก๊าซยุบตัวลงจนเกิดความร้อนและความดันสูงพอที่จะจุดระเบิดนิวเคลียร์ฟิวชัน",
                icon: "✨"
            },
            {
                title: "ลำดับหลัก (Main Sequence)",
                content: "ช่วงชีวิตที่ยาวนานที่สุดของดาวฤกษ์ ซึ่งมันจะเผาผลาญไฮโดรเจนให้เป็นฮีเลียมอย่างต่อเนื่อง ดวงอาทิตย์ของเราอยู่ในระยะนี้มาประมาณ 4.6 พันล้านปีแล้ว",
                icon: "☀️"
            },
            {
                title: "จุดจบ (Death)",
                content: "เมื่อเชื้อเพลิงหมด ดาวฤกษ์จะขยายตัวเป็นยักษ์แดง (Red Giant) และจบชีวิตลง อาจกลายเป็นดาวแคระขาว ดาวนิวตรอน หรือหลุมดำ ขึ้นอยู่กับมวลตั้งต้น",
                icon: "💀"
            }
        ]
    },
    "black_holes": {
        title: "หลุมดำ (Black Holes)",
        content: "หลุมดำคือบริเวณในปริภูมิ-เวลาที่มีแรงโน้มถ่วงสูงมากจนไม่มีอะไรหนีออกมาได้แม้แต่แสง",
        imageUrl: IMAGES.BLACK_HOLE,
        sections: [
            {
                title: "ขอบฟ้าเหตุการณ์ (Event Horizon)",
                content: "คือพรมแดนรอบหลุมดำที่เปรียบเสมือนจุดที่ไม่มีวันหวนกลับ สิ่งใดที่ข้ามเส้นนี้ไปจะถูกดูดเข้าไปตลอดกาล",
                icon: "🚫"
            },
            {
                title: "ภาวะเอกฐาน (Singularity)",
                content: "จุดใจกลางของหลุมดำที่มีความหนาแน่นเป็นอนันต์และขนาดเป็นศูนย์ เป็นที่ที่กฎฟิสิกส์ปัจจุบันใช้ไม่ได้",
                icon: "⚫"
            }
        ]
    },
    "galaxies": {
        title: "กาแล็กซี (Galaxies)",
        content: "ระบบที่กว้างใหญ่ไพศาลประกอบด้วยดาวฤกษ์ ก๊าซ ฝุ่น และสสารมืด ที่ยึดเหนี่ยวกันด้วยแรงโน้มถ่วง",
        imageUrl: IMAGES.GALAXY,
        sections: [
            {
                title: "ทางช้างเผือก (Milky Way)",
                content: "กาแล็กซีบ้านเกิดของเรา เป็นกาแล็กซีกังหันมีคาน (Barred Spiral Galaxy) มีดาวฤกษ์ประมาณ 1-4 แสนล้านดวง",
                icon: "🌌"
            },
            {
                title: "ประเภทของกาแล็กซี",
                content: "แบ่งหลักๆ ได้เป็น กาแล็กซีกังหัน (Spiral), กาแล็กซีรี (Elliptical), และกาแล็กซีไร้รูปแบบ (Irregular)",
                icon: "🌀"
            }
        ]
    },
    "nebulae": {
        title: "เนบิวลา (Nebulae)",
        content: "กลุ่มเมฆหมอกของฝุ่น ก๊าซไฮโดรเจน ฮีเลียม และพลาสมาในอวกาศ เป็นทั้งแหล่งกำเนิดและซากศพของดวงดาว",
        imageUrl: IMAGES.NEBULA,
        sections: [
            {
                title: "เนบิวลาสว่าง (Emission Nebula)",
                content: "เนบิวลาที่เรืองแสงได้ด้วยตัวเองจากการแตกตัวของก๊าซเนื่องจากรังสีอัลตราไวโอเลตจากดาวฤกษ์ร้อนจัดใกล้เคียง เช่น เนบิวลานายพราน",
                icon: "🌟"
            },
            {
                title: "เนบิวลามืด (Dark Nebula)",
                content: "กลุ่มฝุ่นหนาทึบที่บดบังแสงจากดาวฤกษ์ด้านหลัง ทำให้เห็นเป็นเงามืด เช่น เนบิวลาหัวม้า",
                icon: "🌑"
            }
        ]
    },
    "supernova": {
        title: "ซูเปอร์โนวา (Supernova)",
        content: "การระเบิดของดาวฤกษ์มวลมากเมื่อสิ้นอายุขัย ปลดปล่อยพลังงานมหาศาลสว่างกว่าทั้งกาแล็กซีในช่วงเวลาสั้นๆ",
        imageUrl: IMAGES.SUPERNOVA,
        sections: [
            {
                title: "ประเภท Ia",
                content: "เกิดในระบบดาวคู่ที่มีดาวแคระขาวดึงดูดมวลจากดาวเพื่อนบ้านจนเกินขีดจำกัด (Chandrasekhar limit) แล้วระเบิด",
                icon: "💥"
            },
            {
                title: "การยุบตัวของแกน (Core Collapse)",
                content: "เกิดกับดาวฤกษ์มวลมาก (มากกว่า 8 เท่าของดวงอาทิตย์) ที่แกนกลางยุบตัวลงฉับพลันกลายเป็นดาวนิวตรอนหรือหลุมดำ",
                icon: "⚛️"
            }
        ]
    },
    "quasars": {
        title: "ควาซาร์ (Quasars)",
        content: "นิวเคลียสดาราจักรกัมมันต์ (AGN) ที่สว่างที่สุด ขับเคลื่อนด้วยหลุมดำมวลยิ่งยวดที่ใจกลางกาแล็กซี",
        imageUrl: IMAGES.TON618,
        sections: [
            {
                title: "พลังงานมหาศาล",
                content: "ควาซาร์สามารถสว่างกว่ากาแล็กซีทางช้างเผือกทั้งกาแล็กซีได้ถึง 1,000 เท่า ทั้งที่มีขนาดเล็กกว่ามาก",
                icon: "⚡"
            },
            {
                title: "ระยะทางไกลโพ้น",
                content: "ควาซาร์ส่วนใหญ่อยู่ห่างไกลมาก แสงที่เห็นจึงเป็นภาพจากอดีตเมื่อจักรวาลยังเยาว์วัย",
                icon: "🔭"
            }
        ]
    },
    "other_objects": {
        title: "วัตถุอวกาศอื่นๆ",
        content: "นอกจากดาวเคราะห์และดาวฤกษ์ ยังมีวัตถุอื่นๆ อีกมากมายที่ท่องไปในอวกาศ",
        imageUrl: IMAGES.COMET,
        sections: [
            {
                title: "ดาวหาง (Comets)",
                content: "ก้อนน้ำแข็งและฝุ่นสกปรกจากขอบระบบสุริยะ เมื่อเข้าใกล้ดวงอาทิตย์จะระเหิดเกิดเป็นหางยาว",
                icon: "☄️"
            },
            {
                title: "ดาวเคราะห์น้อย (Asteroids)",
                content: "ก้อนหินและโลหะที่หลงเหลือจากการก่อตัวของระบบสุริยะ ส่วนใหญ่อยู่ในแถบระหว่างดาวอังคารและดาวพฤหัสบดี",
                icon: "🪨"
            }
        ]
    },
    "space_tech": {
        title: "เทคโนโลยีอวกาศ",
        content: "เครื่องมือและวิธีการที่มนุษย์สร้างขึ้นเพื่อสำรวจและทำความเข้าใจจักรวาล",
        imageUrl: IMAGES.TECH,
        sections: [
            {
                title: "กล้องโทรทรรศน์อวกาศ (Space Telescopes)",
                content: "เช่น Hubble และ James Webb ที่ช่วยให้เรามองเห็นอวกาศได้ชัดเจนโดยไร้สิ่งรบกวนจากบรรยากาศโลก",
                icon: "🛰️"
            },
            {
                title: "ยานสำรวจ (Rovers)",
                content: "ยานพาหนะที่ออกแบบเพื่อวิ่งบนพื้นผิวดาวเคราะห์อื่น เช่น Curiosity และ Perseverance บนดาวอังคาร",
                icon: "🚙"
            }
        ]
    },
    "space_travel": {
        title: "การเดินทางในอวกาศ",
        content: "ความท้าทายและความเป็นไปได้ในการส่งมนุษย์ออกไปนอกโลก",
        imageUrl: IMAGES.TECH, // Reusing tech image
        sections: [
            {
                title: "สถานีอวกาศนานาชาติ (ISS)",
                content: "ห้องแล็บลอยฟ้าที่มนุษย์อาศัยอยู่ต่อเนื่องมานานกว่า 20 ปี เพื่อทดลองวิจัยในสภาวะแรงโน้มถ่วงต่ำ",
                icon: "🏠"
            },
            {
                title: "การไปดาวอังคาร",
                content: "เป้าหมายต่อไปของมนุษยชาติ ปัญหาหลักคือระยะทางที่ไกล รังสี และผลกระทบต่อร่างกายมนุษย์",
                icon: "🚀"
            }
        ]
    },
    "cosmology": {
        title: "จักรวาลวิทยา (Cosmology)",
        content: "การศึกษาเกี่ยวกับกำเนิด วิวัฒนาการ และอนาคตของเอกภพ",
        imageUrl: IMAGES.COSMOLOGY,
        sections: [
            {
                title: "บิกแบง (Big Bang)",
                content: "ทฤษฎีที่ได้รับการยอมรับมากที่สุดว่าจักรวาลกำเนิดจากการระเบิดครั้งใหญ่เมื่อประมาณ 13.8 พันล้านปีก่อน",
                icon: "💥"
            },
            {
                title: "สสารมืดและพลังงานมืด",
                content: "ส่วนประกอบลึกลับที่มองไม่เห็นแต่มีผลต่อแรงโน้มถ่วงและการขยายตัวของจักรวาล คิดเป็น 95% ของจักรวาลทั้งหมด",
                icon: "❓"
            }
        ]
    }
};