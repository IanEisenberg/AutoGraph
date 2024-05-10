/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { parse, stringify } from 'yaml';

import { LLM } from '../llm';
import { Builder } from '../context';

class Interpreter {

  builder: Builder;
  llm: LLM;

  constructor(builder: Builder, llm: LLM) {
    this.builder = builder;
    this.llm = llm;
  }

  topics(generatedTopics: string): string[] {
    const data = parse(generatedTopics);
    const { Topics } = data;
    return Topics;
  }
  summary(generatedSummary: string): string {
    return generatedSummary;
  }

  async existingEntities(generatedSummary: string, entity_type: string, previous_entities: string[]): Promise<string[]> {
    const prompt_data = {
      entity_type,
      previous_entities,
      summary: generatedSummary
    };
    const { system, user } = this.builder.generateIdentityEntitiesPrompt(prompt_data);
    const identifiedEntities = await this.llm.generate(system, user);
    return identifiedEntities ? parse(identifiedEntities) : [];
  }

  newEntities(generatedSummary: string, raw_new_entities: string[]): string[] {
    return [];
  }
}

class FakeInterpreter extends Interpreter {
  topics(generatedTopics: string): string[] {
    return Array(5)
      .fill(null)
      .map(() => faker.hacker.phrase());
  }

  summary(generatedSummary: string): string {
    return faker.lorem.paragraph();
  }

  async existingEntities(generatedSummary: string, entity_type: string, previous_entities: string[]): Promise<string[]> {
    return Promise.resolve(Array(5)
      .fill(null)
      .map(() => faker.hacker.noun()));
  }

  newEntities(generatedSummary: string, raw_new_entities: string[]): string[] {
    const newEntities = Array(1)
      .fill(null)
      .map(() => faker.hacker.noun());
    return newEntities.filter((entity) => !raw_new_entities.includes(entity));
  }
}

export { Interpreter, FakeInterpreter };
