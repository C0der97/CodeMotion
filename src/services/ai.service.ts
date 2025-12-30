import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  
  isLoading = signal<boolean>(false);
  explanation = signal<string>('');

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async generateExplanation(topic: string, context: string) {
    if (!process.env['API_KEY']) {
      this.explanation.set("API Key not found. Please set your API_KEY to use AI features.");
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Explain the programming concept "${topic}" in the context of "${context}". 
        Keep it brief (max 3 sentences), fun, and educational. Use a friendly tone suitable for a beginner.
        Focus on the "Why" and "How".`
      });
      
      this.explanation.set(response.text || 'No explanation generated.');
    } catch (error) {
      console.error('AI Error:', error);
      this.explanation.set('Failed to generate explanation. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}