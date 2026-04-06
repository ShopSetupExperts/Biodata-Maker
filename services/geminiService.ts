import { GoogleGenAI } from "@google/genai";
import { BioData, SectionDetails, SectionList } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to find value by label across all sections
const findValue = (data: BioData, searchLabel: string): string => {
  for (const section of data.sections) {
    if (section.type === 'details') {
      const field = (section as SectionDetails).fields.find(f => f.label.toLowerCase().includes(searchLabel.toLowerCase()));
      if (field) return field.value;
    }
  }
  return "";
};

const getEducation = (data: BioData): string[] => {
  for (const section of data.sections) {
    if (section.type === 'list' && (section.title.toLowerCase().includes('education') || section.title.toLowerCase().includes('qualification'))) {
      return (section as SectionList).items;
    }
  }
  return [];
};

export const generateBioSummary = async (data: BioData): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const name = findValue(data, "Name");
    const occupation = findValue(data, "Occupation");
    const fatherOcc = findValue(data, "Father's Occupation") || findValue(data, "Father");
    const motherOcc = findValue(data, "Mother's Occupation") || findValue(data, "Mother");
    const religion = findValue(data, "Religion");
    const education = getEducation(data);

    // Construct a prompt based on the available data
    const prompt = `
      Write a polite, professional, and elegant 3-4 sentence "About Me" or "Objective" summary suitable for a marriage or professional Bio Data document.
      
      Use the following details:
      Name: ${name}
      Occupation: ${occupation}
      Education: ${education.join(", ")}
      Family Background: Father is ${fatherOcc}, Mother is ${motherOcc}.
      Religion: ${religion}
      
      Tone: Respectful, traditional yet modern, humble.
      Do not include the raw data lists, just a cohesive narrative summary.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};