

import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, CelestialBody, QuizQuestion, DatabaseTopic } from "../types";
import { MOCK_PLANET_DATA, MOCK_DATABASE_DATA, MOCK_QUIZZES } from "../mockData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Removed deprecated Schema type. The type of quizQuestionSchema is inferred.
const quizQuestionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The quiz question in Thai." },
      options: {
        type: Type.ARRAY,
        description: "An array of 4 possible answers in Thai.",
        items: { type: Type.STRING }
      },
      correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." },
      explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct, in Thai." }
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"]
  }
};

// Fallback if no specific mock data found
const GENERIC_BACKUP_QUIZ: QuizQuestion[] = [
  {
    question: "ดาวเคราะห์ดวงใดอยู่ใกล้ดวงอาทิตย์ที่สุด?",
    options: ["ดาวพุธ", "ดาวศุกร์", "โลก", "ดาวอังคาร"],
    correctAnswerIndex: 0,
    explanation: "ดาวพุธเป็นดาวเคราะห์ที่อยู่ใกล้ดวงอาทิตย์ที่สุดในระบบสุริยะ"
  },
  {
    question: "ดาวเคราะห์ดวงใดใหญ่ที่สุด?",
    options: ["โลก", "ดาวเสาร์", "ดาวพฤหัสบดี", "ดาวเนปจูน"],
    correctAnswerIndex: 2,
    explanation: "ดาวพฤหัสบดีเป็นพี่ใหญ่แห่งระบบสุริยะ"
  }
];

// Robust JSON Extractor
const cleanJsonText = (text: string): string => {
  if (!text) return "[]";
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) return match[1].trim();
  const firstOpenBrace = text.indexOf('{');
  const firstOpenBracket = text.indexOf('[');
  let start = -1;
  let end = -1;
  if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
    start = firstOpenBrace;
    end = text.lastIndexOf('}');
  } else if (firstOpenBracket !== -1) {
    start = firstOpenBracket;
    end = text.lastIndexOf(']');
  }
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text.trim();
};

const ensureString = (val: any): string => {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) return val.map(ensureString).join(', ');
  if (typeof val === 'object') {
    if (val.text) return String(val.text);
    if (val.value) return String(val.value);
    if (val.name) return String(val.name);
    try { return JSON.stringify(val); } catch { return "[Object]"; }
  }
  return String(val);
};

const sanitizeQuizData = (raw: any): QuizQuestion[] => {
  if (!Array.isArray(raw)) return GENERIC_BACKUP_QUIZ;
  return raw.map((item: any) => {
    let question = "Unknown Question";
    if (item?.question) { question = ensureString(item.question); }
    let options: string[] = ["A", "B", "C", "D"];
    if (Array.isArray(item.options)) { options = item.options.map((opt: any) => ensureString(opt)); }
    let explanation = "No explanation provided.";
    if (item?.explanation) { explanation = ensureString(item.explanation); }
    return {
        question,
        options,
        correctAnswerIndex: typeof item.correctAnswerIndex === 'number' ? item.correctAnswerIndex : 0,
        explanation
    };
  });
};


export const fetchPlanetData = async (planetName: string, thaiName: string): Promise<ScanResult> => {
  // 1. Check Mock Data First (Preferred for stability & image quality)
  // Fix key access logic to handle potential casing issues
  const mockKeys = Object.keys(MOCK_PLANET_DATA);
  // Match loosely but prioritize exact matches in constants.ts logic
  const matchedKey = mockKeys.find(k => k.toLowerCase() === planetName.toLowerCase() || planetName.toLowerCase().includes(k.toLowerCase()));
  
  if (matchedKey) {
      const mock = MOCK_PLANET_DATA[matchedKey];
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      return mock;
  }

  // 2. Fallback
  return {
    planetName: thaiName,
    summary: "Data Uplink Offline. Using backup protocols.",
    temperature: "Unknown",
    gravity: "Unknown",
    funFact: "Database connection failed.",
    orbitPeriod: "Unknown",
    rotationPeriod: "Unknown",
    distanceFromEarth: "Unknown",
    moons: "Unknown",
    atmosphere: "Unknown",
    potentialForLife: "Unknown",
    structure: "Unknown",
    imageUrl: null
  };
};

export const askShipComputer = async (question: string, nearbyPlanet: CelestialBody | null): Promise<string> => {
  try {
    const context = nearbyPlanet 
      ? `Near ${nearbyPlanet.thaiName}.`
      : `Deep space.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Context: ${context}. Question: "${question}". Answer in Thai. Keep it short (under 2 sentences).`,
    });
    return ensureString(response.text) || "Systems offline.";
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    if (errorStr.includes('429')) return "⚠️ QUOTA EXCEEDED. TRY LATER.";
    if (errorStr.includes('400')) return "⚠️ API KEY INVALID.";
    return "Error processing request.";
  }
};

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Helper to shuffle options inside a question
function randomizeQuestion(q: QuizQuestion): QuizQuestion {
    // Attach original index to track the correct answer
    const optionsWithIndices = q.options.map((opt, idx) => ({ 
        text: opt, 
        originalIndex: idx 
    }));
    
    // Shuffle options
    const shuffledOptions = shuffleArray(optionsWithIndices);
    
    // Find new position of the correct answer
    const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIndex === q.correctAnswerIndex);
    
    return {
        ...q,
        options: shuffledOptions.map(o => o.text),
        correctAnswerIndex: newCorrectIndex === -1 ? 0 : newCorrectIndex,
    };
}

export const generatePlanetQuiz = async (planetName: string, thaiName: string): Promise<QuizQuestion[]> => {
  // 1. Try to find MOCK QUIZ DATA first to save quota and ensure quality
  // Check against English Name
  let questions: QuizQuestion[] | undefined = MOCK_QUIZZES[planetName];
  
  if (!questions) {
     // Try finding by generic keys if strict match fails
     const keys = Object.keys(MOCK_QUIZZES);
     const found = keys.find(k => planetName.toLowerCase().includes(k.toLowerCase()));
     if (found) questions = MOCK_QUIZZES[found];
  }

  if (questions && questions.length > 0) {
      // Shuffle questions AND shuffle options within them
      const shuffledQuestions = shuffleArray(questions);
      const selectedQuestions = shuffledQuestions.slice(0, 10);
      return selectedQuestions.map(randomizeQuestion);
  }

  // 2. Fallback to AI if no mock data (Unlikely with updated mockData.ts)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create 10 multiple-choice questions about ${planetName} (${thaiName}) in Thai.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizQuestionSchema,
      }
    });
    
    const text = response.text;
    if (!text) return GENERIC_BACKUP_QUIZ.map(randomizeQuestion);
    const cleanedText = cleanJsonText(text);
    const parsed = JSON.parse(cleanedText);
    const sanitized = sanitizeQuizData(parsed);
    return sanitized.map(randomizeQuestion);

  } catch (error: any) {
    console.warn("Quiz Gen Error. Using Generic Backup.");
    return GENERIC_BACKUP_QUIZ.map(randomizeQuestion);
  }
};

export const fetchDatabaseTopic = async (topic: string, thaiTitle: string): Promise<DatabaseTopic> => {
  let key = topic.toLowerCase().replace(/ /g, '_');
  
  const mockData = MOCK_DATABASE_DATA[key];
  
  if (mockData) {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      return mockData;
  }
  
  return {
      title: thaiTitle,
      content: "Data corruption detected. Unable to retrieve archive.",
      imageUrl: null,
      sections: []
  };
};