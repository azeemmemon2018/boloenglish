import { scenesModule1 } from './scenesModule1';
import { scenesModule2 } from './scenesModule2';
import { scenesModule3 } from './scenesModule3';
import { scenesModule4 } from './scenesModule4';
import { scenesModule5 } from './scenesModule5';
import { scenesModule6 } from './scenesModule6';
import { scenesModule7 } from './scenesModule7';
import { scenesModule8 } from './scenesModule8';
import { scenesModule9 } from './scenesModule9';
import { scenesModule10 } from './scenesModule10';
import { Scene } from '../types';

export const allScenes: Scene[] = [
  ...scenesModule1,
  ...scenesModule2,
  ...scenesModule3,
  ...scenesModule4,
  ...scenesModule5,
  ...scenesModule6,
  ...scenesModule7,
  ...scenesModule8,
  ...scenesModule9,
  ...scenesModule10,
];

export const allCategories: { name: string; nameUrdu: string }[] = [
  { name: "All", nameUrdu: "تمام حالات و مناظر (100)" },
  { name: "Morning Routine", nameUrdu: "صبح کا معمول" },
  { name: "Daily Commute", nameUrdu: "روزانہ کا سفر" },
  { name: "Office Arrival", nameUrdu: "دفتر آمد اور سیٹ اپ" },
  { name: "Team Meetings", nameUrdu: "ٹیم میٹنگز" },
  { name: "Communication", nameUrdu: "دفتری مواصلات" },
  { name: "Deep Work", nameUrdu: "گہرا کام اور فوکس" },
  { name: "Client Communication", nameUrdu: "کلائنٹس اور صارفین" },
  { name: "Lunch & Socializing", nameUrdu: "کھانا اور میل جول" },
  { name: "Problem Solving", nameUrdu: "مسائل اور حل" },
  { name: "Presentations", nameUrdu: "پیشکش اور پریزنٹیشن" },
  { name: "Evening Wrap-up", nameUrdu: "شام کا اختتام اور واپسی" },
  { name: "Shopping & Errands", nameUrdu: "خریداری اور روزمرہ کے کام" },
  { name: "Health & Wellness", nameUrdu: "صحت اور تندرستی" },
  { name: "Travel & Hospitality", nameUrdu: "سفر، ہوائی اڈہ اور ہوٹل" },
  { name: "Career & Interviews", nameUrdu: "ملازمت، انٹرویو اور کیریئر" },
  { name: "Tech & Social Life", nameUrdu: "ٹیکنالوجی اور سماجی زندگی" },
];
