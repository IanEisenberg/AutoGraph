import OpenAI from 'openai';

interface LLMEngine {
  generate(systemPrompt: string, userPrompt: string): Promise<string | null>;
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
    return this.engine.generate(systemPrompt, userPrompt);
  }
}

export { LLM, OpenAIEngine, FakerEngine };
