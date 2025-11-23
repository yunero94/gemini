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
    2. A short "dailyTip" that is a Stoic quote or philosophy related to discipline, strength, and endurance.
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
        dailyTip: { type: Type.STRING, description: "A Stoic-style quote about strength and discipline." },
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

export const generateCategoryIcon = async (category: string): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  
  let subject = category;
  // Refine subject for better icon generation
  if (category === 'WORKOUT') subject = "dumbbell gym weight";
  if (category === 'NUTRITION') subject = "healthy apple fruit";
  if (category === 'MINDSET') subject = "human brain intelligence";
  if (category === 'HYDRATION') subject = "water drop splash";

  const prompt = `
    Generate a simple, high-contrast, vector-style UI icon for "${subject}".
    Style: Minimalist, glowing neon lime green lines on a solid black background.
    The icon should be centered, bold, and clearly recognizable as a user interface icon.
    No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
         // No specific mime type for image generation requests
      }
    });

    // Check for inline data (image bytes)
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to generate icon for ${category}`, error);
    return null;
  }
};