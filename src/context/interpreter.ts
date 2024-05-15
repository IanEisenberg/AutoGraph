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
    // TODO: check for valid format!
    return Topics;
  }
  
  summary(generatedSummary: string): string {
    const splitText = generatedSummary.split('ENTITIES:');
    return splitText[0];
  }


  
  async entities(generatedSummary: string, entity_type: string, previous_entities: string[]): Promise<{
    new_entities: string[]; existing_entities: string[]; 
  }> {
    let identifiedEntities = {
      new_entities: [],
      existing_entities: [],
    };

    const splitText = generatedSummary.split('ENTITIES:');
    if (splitText.length > 1) {
      const entitiesText = splitText[1];
      try {
        identifiedEntities = parse(entitiesText);
      } catch (error) {
        console.error('Failed to parse entities from text:', error);
      }
    }
    return identifiedEntities;
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

  async entities(generatedSummary: string, entity_type: string, previous_entities: string[]): Promise<{
    new_entities: string[];
    existing_entities: string[];
}> {

    const identifiedEntities = {
      new_entities: Array(5)
        .fill(null)
        .map(() => faker.hacker.noun()),
      existing_entities: Array(5)
        .fill(null)
        .map(() => faker.hacker.noun()),
    };
    return Promise.resolve(identifiedEntities);
  }

  newEntities(generatedSummary: string, raw_new_entities: string[]): string[] {
    const newEntities = Array(1)
      .fill(null)
      .map(() => faker.hacker.noun());
    return newEntities.filter((entity) => !raw_new_entities.includes(entity));
  }
}

export { Interpreter, FakeInterpreter };
