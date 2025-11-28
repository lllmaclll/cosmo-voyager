// FIX: Import ElementType to resolve React namespace error.
import type { ElementType } from 'react';

export interface Vector2 {
  x: number;
  y: number;
}

export type CelestialType = 'STAR' | 'PLANET' | 'MOON' | 'DWARF_PLANET' | 'BLACK_HOLE' | 'GALAXY' | 'ASTEROID' | 'COMET' | 'NEBULA' | 'QUASAR' | 'SUPERNOVA';

export interface CelestialBody {
  id: string;
  name: string;
  thaiName: string;
  type: CelestialType;
  color: string;
  gradient?: string; // New: For realistic rendering
  size: number; // radius in pixels for the game view
  distanceFromSun: number; // abstract units
  description?: string;
  position: Vector2;
  orbitSpeed: number;
  angle?: number; // For orbital calculation
}

export interface ScanResult {
  planetName: string;
  summary: string;
  temperature: string;
  gravity: string;
  funFact: string;
  imageUrl?: string | null;
  // New fields for deeper knowledge
  orbitPeriod: string; // ระยะเวลาโคจรรอบดวงอาทิตย์ (1 ปี)
  rotationPeriod: string; // ระยะเวลาหมุนรอบตัวเอง (1 วัน)
  distanceFromEarth: string; // ระยะห่างจากโลก
  moons: string; // จำนวนดวงจันทร์หรือชื่อดวงจันทร์สำคัญ
  atmosphere: string; // องค์ประกอบชั้นบรรยากาศ
  potentialForLife: string; // ความเป็นไปได้ของสิ่งมีชีวิต
  structure: string; // โครงสร้างดาว (หิน/ก๊าซ)
}

export enum GameMode {
  MENU = 'MENU',
  FLIGHT = 'FLIGHT',
  SCANNING = 'SCANNING',
  DATABASE = 'DATABASE'
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  targetBodyId: string;
  completed: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface DialogueLine {
  speaker: 'player' | 'boss';
  text: string;
}

// New Types for Galactic Database
export interface DatabaseCategory {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
}

export interface DatabaseSection {
    title: string;
    content: string;
    icon?: string; // Optional icon/emoji
}

export interface DatabaseTopic {
  title: string;
  content: string; // Keep for backward compatibility or simple summary
  imageUrl: string | null;
  sections?: DatabaseSection[]; // New structured content
}