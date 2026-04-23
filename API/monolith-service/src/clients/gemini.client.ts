import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
	return genAI.getGenerativeModel({ model: modelName });
};

export const getEmbeddingModel = (modelName: string = "gemini-embedding-001") => {
	return genAI.getGenerativeModel({ model: modelName });
};

export default genAI;
