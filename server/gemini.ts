import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || '';
  return key.trim();
}

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = getApiKey();
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'startsmart-lms',
        },
      },
    });
  }
  return aiClient;
}

export async function checkGeminiStatus() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      configured: false,
      model: 'smarttutor-core',
      status: 'missing_key',
      message: 'AI API key is not configured.',
    };
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping',
    });

    return {
      configured: true,
      connected: true,
      model: 'smarttutor-core',
      projectName: process.env.GEMINI_PROJECT_NAME || '',
      projectNumber: process.env.GEMINI_PROJECT_NUMBER || '',
      pingResponse: response.text?.trim() || 'OK',
      status: 'ready',
    };
  } catch (error: any) {
    console.error('SmartTutor status check error:', error);
    return {
      configured: true,
      connected: false,
      model: 'smarttutor-core',
      status: 'error',
      message: error?.message || 'Failed to communicate with AI service.',
    };
  }
}

export async function askStartSmartTutor(params: {
  question: string;
  courseTitle?: string;
  studentName?: string;
  conversationHistory?: Array<{ role: 'user' | 'model'; text: string }>;
}) {
  const ai = getGeminiClient();
  const { question, courseTitle, studentName, conversationHistory = [] } = params;

  const systemInstruction = `You are "SmartTutor AI", the official academic and technology tutor for StartSmart Tech Hub (based in Tamale, Northern Region, Ghana).
Your role is to support students in practical technology fields including Full-Stack Web Development, Data Science & Analytics, Cybersecurity, Cloud Computing, Mobile Apps, UI/UX Design, and AI & Robotics.
Be encouraging, clear, educational, and concise. Provide practical code snippets when applicable, explain core concepts, and guide students toward mastering tech skills.
Address the student politely${studentName ? ` as ${studentName}` : ''}${courseTitle ? ` in the context of the course "${courseTitle}"` : ''}.
Motto: Empowering Next-Gen Digital Leaders & Tech Innovators.`;

  // Build contents with past history if provided
  const contents: any[] = [];
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: question }],
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return {
    answer: response.text || 'I apologize, but I could not formulate a response at this time.',
    model: 'smarttutor-ai',
    timestamp: new Date().toISOString(),
  };
}

export async function generateCourseSyllabus(params: {
  topic: string;
  level?: string;
  durationWeeks?: number;
}) {
  const ai = getGeminiClient();
  const { topic, level = 'Intermediate', durationWeeks = 8 } = params;

  const prompt = `Generate a structured, industry-aligned course syllabus for "${topic}" at the ${level} level spanning ${durationWeeks} weeks for StartSmart Tech Hub. Return structured JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an expert technical curriculum designer for an African tech hub preparing youths for global remote and local tech jobs.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          courseTitle: { type: Type.STRING },
          tagline: { type: Type.STRING },
          overview: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          prerequisites: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          learningOutcomes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.INTEGER },
                theme: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                handsOnProject: { type: Type.STRING },
              },
              required: ['weekNumber', 'theme', 'topics', 'handsOnProject'],
            },
          },
          capstoneProject: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description'],
          },
        },
        required: ['courseTitle', 'overview', 'learningOutcomes', 'weeks', 'capstoneProject'],
      },
    },
  });

  const rawJson = response.text || '{}';
  return JSON.parse(rawJson);
}

export async function generateQuizQuestions(params: {
  topic: string;
  count?: number;
  difficulty?: string;
}) {
  const ai = getGeminiClient();
  const { topic, count = 4, difficulty = 'medium' } = params;

  const prompt = `Create a ${count}-question multiple choice quiz on "${topic}" with difficulty "${difficulty}". Include explanations for correct answers. Return structured JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctOptionIndex', 'explanation'],
            },
          },
        },
        required: ['topic', 'questions'],
      },
    },
  });

  const rawJson = response.text || '{}';
  return JSON.parse(rawJson);
}
