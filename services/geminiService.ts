
import { GoogleGenAI } from "@google/genai";
import type { Tournament } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateTournamentDescription = async (tournament: Partial<Tournament>): Promise<string> => {
    if (!API_KEY) {
        return "AI features are disabled. Please set your API_KEY.";
    }

    const prompt = `
        Generate a short, exciting, and professional description for a billiard tournament with the following details. 
        The description should be suitable for a tournament website or promotional material.
        - Tournament Name: ${tournament.name}
        - Game Format: ${tournament.gameFormat}
        - Location: ${tournament.location}
        - Prize Pool: $${tournament.prizePool?.toLocaleString()}
        - Tournament Type: ${tournament.type}
        
        Keep it to 2-3 sentences. Make it sound prestigious and competitive.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating tournament description:", error);
        return "There was an error generating the description. Please try again.";
    }
};
