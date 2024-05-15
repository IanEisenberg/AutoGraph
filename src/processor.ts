import { LLM } from './llm';
import { Builder, Interpreter, FakeInterpreter } from './context';
import { Exporter } from './exporter';
import { TopicData } from './types';
import fs from 'fs';
import path from 'path';

class InputProcessor {
  llm: LLM;
  builder: Builder;
  interpreter: Interpreter;
  exporter: Exporter;
  config: {
    outputDir: string
  };

  /**
   * InputProcessor constructor
   * @constructor
   */
  constructor(llm: LLM, config: any = {}) {
    this.config = config;
    this.llm = llm;
    this.builder = new Builder();
    this.interpreter = new Interpreter(this.builder, this.llm);
    this.exporter = new Exporter(config);
  }

  /**
   * getInputs function
   * This is the raw text that will be processed
   * @returns {string} raw_input - The raw input that will be processed
   */
  getInputs(fileLocation: string): string {
    const raw_input = fs.readFileSync(fileLocation, 'utf-8');
    return raw_input;
  }

  /**
   * generateTopicsFromInput function
   * This function generates topics from the raw input
   * @param {string} raw_input - The raw input from which topics will be generated
   * @returns {string[]} topics - The topics generated from the raw input
   */

  async generateTopicsFromInput(raw_input: string): Promise<string[]> {
    let topics: string[] = [];
    const prompt_data = {
      raw_input: raw_input,
    };
    const { system, user } = this.builder.generateTopicPrompt(prompt_data);
    // llm call
    const generatedTopics = await this.llm.generate(system, user);

    if (generatedTopics === null) {
      // log
      console.log('LLM returned null');
      return topics;
    }
    // interpreter call
    topics = this.interpreter.topics(generatedTopics);

    return topics;
  }

  /**
   * generateSummary function
   * This function generates a summary from the raw input, topic, domains, existing entities, and new entities
   * @param {string} raw_input - The raw input from which the summary will be generated
   * @param {string} topic - The topic for which the summary will be generated
   * @param {string[]} existing_entities - The existing entities from the knowledge graph
   * @param {string[]} raw_new_entities - The new entities generated from the previous call of generateSummary
   * @returns {object} summaryData - The summary data including summary text, existing entities used, new entities, and topic
   */

  async generateTopicSummary(
    raw_input: string,
    topic: any,
    existing_entities: string[],
    raw_new_entities: string[] = [],
  ): Promise<{
    summary_text: string;
    existing_entities_used: string[];
    new_entities: string[];
  }> {
    const prompt_data = {
      raw_input,
      topic_name: topic.topic_name || '',
      description: topic.description || '',
      existing_entities,
      raw_new_entities,
    };
    const { system, user } = this.builder.generateTopicSummaryPrompt(prompt_data);
    const generatedSummary = await this.llm.generate(system, user);
    if (generatedSummary === null) {
      // log
      console.log('Summary returned null');
      return { summary_text: '', existing_entities_used: [], new_entities: [] };
    }

    const summary_text: string = this.interpreter.summary(generatedSummary);
    const entity_type = '';
    const previous_entities: any = [];
    const entities =
      await this.interpreter.entities(generatedSummary, entity_type, previous_entities );

    const { existing_entities: existing_entities_used, new_entities} = entities;
    return {
      summary_text,
      existing_entities_used,
      new_entities,
    };
  }

  /**
   * processTopics function
   * This function processes each topic to generate a summary
   * @param {string} raw_input - The raw input from which the summary will be generated
   * @param {string[]} topics - The topics for which the summary will be generated
   * @returns {object[]} topicsData - The topics data including topic input, summary text, existing entities used, and new entities
   */
  
  async processTopics(raw_input: string, topics: any[], existing_entities: string[] = [], update = () => {}): Promise<TopicData> {
    const topicsData: { [key: string]: any } = {};
    let raw_new_entities: string[] = [];

    // console.log("processTopics")
    // console.log(topics)

    for (const topic of topics) {
      // console.log(topic)
      const { summary_text, existing_entities_used, new_entities } =
        await this.generateTopicSummary(
          raw_input,
          topic,
          existing_entities,
          raw_new_entities,
        );
      raw_new_entities = Array.from(
        new Set(raw_new_entities.concat(new_entities)),
      );

      topicsData[(topic as any).topic_name] = {
        topic_input: (topic as any).topic_name,
        summary_text,
        existing_entities_used,
        new_entities,
      };
      update();
    }

    return topicsData;
  }

  /**
   * identifyEntities function
   * This function processes each topic to generate a summary
   * @returns {object[]} topicsData - The topics data including topic input, summary text, existing entities used, and new entities
   */
  async identifyEntities(topicsData: { [key: string]: any }): Promise<TopicData> {
    const existing_entities: string[] = [];
    const raw_new_entities: string[] = [];



    // topicsData[(topic as any).topic_name] = {
    //   topic_input: (topic as any).topic_name,
    //   summary_text,
    //   existing_entities_used,
    //   new_entities,
    // };
    

    return topicsData;
  }

  /**
   * generateEntitySummaryMap function
   * This function generates a map of entities to summaries
   * @param {object} topicsData - The topics data including topic input, summary text, existing entities used, and new entities
   * @returns {object} entitySummaryMap - The entity summary map including entity and summary
   */
  generateEntitySummaryMap(topic_data: TopicData): { existing_entities: Record<string, string[]>, new_entities: Record<string, string[]> } {
    const existing_entities: Record<string, string[]> = {};
    const new_entities: Record<string, string[]> = {};

    Object.entries(topic_data).forEach(([key, value]) => {
      value.existing_entities_used?.forEach((entity) => {
        existing_entities[entity] = existing_entities[entity] || [];
        existing_entities[entity].push(key);
      });

      value.new_entities?.forEach((entity) => {
        new_entities[entity] = new_entities[entity] || [];
        new_entities[entity].push(key);
      });
    });

    return { existing_entities, new_entities };
  }

  getSummaryFromEntity(topic_data: TopicData, summary_keys: string[]): string[] {
    return summary_keys.map(key => topic_data[key].summary_text);
  }

  async updateEntity(topic_data: TopicData, key: string, summary_keys: string[], existing_entity: string, known_entities: string[]): Promise<string> {
    const summaries = 
    summary_keys.map(key => topic_data[key].summary_text);
    const prompt_data = { key, existing_entity, summaries, known_entities };
    // generate prompt
    const { system, user } = this.builder.generateUpdateEntityPrompt(prompt_data);
    // llm call
    const updatedEntity = await this.llm.generate(system, user);
    // return
    return updatedEntity || '';
  }

  async createEntity(topic_data: TopicData, key: string, summary_keys: string[], known_entities: string[]): Promise<string> {
    const summaries = 
    summary_keys.map(key => topic_data[key].summary_text);
    const prompt_data = { key, summaries, known_entities };
    // generate prompt
    const { system, user } = this.builder.generateCreateEntityPrompt(prompt_data);
    // llm call
    const createdEntity = await this.llm.generate(system, user);
    return createdEntity || '';
  }

  async getExistingEntities(workingDir: string): Promise<string[]> {
    const entitiesDir = path.join(workingDir, 'entity');
    let entityFiles: string[] = [];

    const getAllMdFiles = (dir: string): string[] => {
      const results: string[] = [];
      const stack: string[] = [dir];

      while (stack.length > 0) {
        const currentDir = stack.pop()!;
        const list = fs.readdirSync(currentDir);

        list.forEach((file) => {
          const filePath = path.join(currentDir, file);
          const stat = fs.statSync(filePath);

          if (stat && stat.isDirectory()) {
            stack.push(filePath);
          } else if (file.endsWith('.md')) {
            results.push(path.relative(entitiesDir, filePath));
          }
        });
      }
      return results.sort((a, b) => a.localeCompare(b));
    };

    try {
      entityFiles = getAllMdFiles(entitiesDir);
    } catch (error) {
      console.error(`Error reading directory ${entitiesDir}:`, error);
    }
    return entityFiles;
  }

  async fetchEntity(filePath: string): Promise<string> {
    const fullPath = `${this.config.outputDir}/entity/${filePath}.md`;
    try {
      return fs.promises.readFile(fullPath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file ${fullPath}:`, error);
      return '';
    }
  }

  async processEntities(topic_data: TopicData, existing_entities: Record<string, string[]>, new_entities: Record<string, string[]>, known_entities: string[], update = () => {}): Promise<{ updated_entities: Record<string, string>, created_entities: Record<string, string> }> {
    const updated_entities: Record<string, string> = {};
    const created_entities: Record<string, string> = {};

    for (const key in existing_entities) {
      const existing_entity = await this.fetchEntity(key);
      const updated_entity = await this.updateEntity(topic_data, key, existing_entities[key], existing_entity, known_entities);
      updated_entities[key] = updated_entity;
      update();
    }

    for (const key in new_entities) {
      const created_entity = await this.createEntity(topic_data, key, new_entities[key], known_entities);
      created_entities[key] = created_entity;
      update();
    }

    return { updated_entities, created_entities };
  }

  async generateDocumentSummary(raw_input: string, node_info: string): Promise<string> {
    const prompt_data = {
      raw_input: raw_input,
    };
    // generate prompt
    const { system, user } = this.builder.generateDocumentSummaryPrompt(prompt_data);
    // llm call
    const docSummary = await this.llm.generate(system, user);

    const dashedLine = '\n------------------------\n';
    const modifiedDocSummary = `${docSummary}\n${dashedLine}\n${node_info}`;
    return modifiedDocSummary || '';
  }

  async exportTopicSummaries(topics: TopicData): Promise<void> {
    this.exporter.exportTopicSummaries(topics);
  }

  async exportEntities(entities: Record<string, string>): Promise<void> {
    this.exporter.exportEntities(entities);
  }

  async exportDocSummary(doc_summary: string): Promise<void> {
    this.exporter.exportDocSummary(doc_summary);
  }

}

export { InputProcessor, TopicData };