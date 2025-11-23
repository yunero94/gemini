import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, GeminiDayResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFitnessPlan = async (profile: UserProfile): Promise<GeminiDayResponse[]> => {
  const model = "gemini-2.5-flash";

  // Calculate total days for a 4-week plan
  const totalDays = profile.daysPerWeek * 4;

  const prompt = `
    Create a complete 4-WEEK (Monthly) fitness and wellness routine for a person named ${profile.name}.
    
    User Profile:
    - Goal: ${profile.goal}
    - Fitness Level: ${profile.level}
    - Commitment: ${profile.daysPerWeek} days per week.
    
    Output Requirements:
    1. Generate exactly ${totalDays} days of content (4 weeks x ${profile.daysPerWeek} days).
    2. Organize the result as a flat list, chronological order: Week 1 Day 1... up to Week 4 Day ${profile.daysPerWeek}.
    3. Implement "Progressive Overload": Week 1 should be introductory, Week 4 should be the most challenging.
    
    For each day, provide:
    1. A "focus" title (e.g., "Week 1: Foundations - Leg Day", "Week 4: Max Effort - Upper Body").
    2. A short, actionable "dailyTip" (1-2 sentences).
    3. A list of actionable tasks (workouts, nutrition, mindset).
    
    Do NOT include rest days in the output. Only output the ${totalDays} active days.
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.STRING, description: "e.g., Week 1 - Day 1, or Monday" },
        focus: { type: Type.STRING, description: "Main focus of the day" },
        dailyTip: { type: Type.STRING, description: "A short motivational tip." },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Actionable task item (max 10 words)" },
              category: { type: Type.STRING, enum: ["workout", "nutrition", "mindset", "hydration"] }
            },
            required: ["description", "category"]
          }
        }
      },
      required: ["day", "focus", "dailyTip", "tasks"]
    }
  };

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // Increased token limit for monthly plan (approx 20 days * tokens per day)
        // We rely on the model's default or manage length via prompt, 
        // but explicit instruction helps.
        systemInstruction: "You are an elite fitness coach designing a 30-day transformation program. Be concise.",
      },
    });

    if (result.text) {
      return JSON.parse(result.text) as GeminiDayResponse[];
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};