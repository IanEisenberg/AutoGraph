import OpenAI from 'openai';
import ollama from 'ollama';
import { logger } from './utils';
interface LLMEngine {
  generate(systemPrompt: string, userPrompt: string): Promise<string | null>;
}


class OllamaEngine implements LLMEngine {
  async generate(systemPrompt: string, userPrompt: string): Promise<string | null> {
    try {
      const request = {
        model: 'llama3',
        prompt: userPrompt,
        system: systemPrompt,
        format: 'json',
        options: {
          vocab_only: true,
        }
      };

      const response = await ollama.generate(request);
      if (response && response.response) {
        return response.response;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to generate response from Ollama:', error);
      return null;
    }
  }
}


class OpenAIEngine implements LLMEngine {
  private openai: OpenAI;
  public model: string;

  constructor(model = 'gpt-3.5-turbo') {
    this.openai = new OpenAI();
    this.model = model;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: this.model,
    });
    return completion.choices[0].message.content;
  }
}

class FakerEngine implements LLMEngine {
  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    return `System Prompt: ${systemPrompt}, User Prompt: ${userPrompt}`;
  }
}

class LLM {
  engine: LLMEngine;

  constructor(engine: LLMEngine) {
    this.engine = engine;
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null> {
    const response = await this.engine.generate(systemPrompt, userPrompt);
    logger.log('Prompt:', `System\n${systemPrompt}\nUser:\n${userPrompt}`);
    logger.log('Response:', response);
    return response;
  }
}

export { LLM, OpenAIEngine, OllamaEngine, FakerEngine };
