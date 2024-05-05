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
    return data;
  }
  summary(generatedSummary: string): string {
    return generatedSummary;
  }

  existingEntities(generatedSummary: string): string[] {
    // 
    return [];
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

  existingEntities(generatedSummary: string): string[] {
    return Array(5)
      .fill(null)
      .map(() => faker.hacker.noun());
  }

  newEntities(generatedSummary: string, raw_new_entities: string[]): string[] {
    const newEntities = Array(1)
      .fill(null)
      .map(() => faker.hacker.noun());
    return newEntities.filter((entity) => !raw_new_entities.includes(entity));
  }
}

export { Interpreter, FakeInterpreter };
