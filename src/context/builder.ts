import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { entity_types } from '../config.json';

function getPrompt(filename: string): string {
  const filePath = path.join(__dirname, './prompts', filename);
  const prompt = fs.readFileSync(filePath, 'utf-8');
  return prompt;
}

function mergeData(template: string, data: { [key: string]: any }): string {
  const compiledTemplate = Handlebars.compile(template);
  const result = compiledTemplate(data);
  return result;
}
function formatEntityDescriptions(entityTypes: typeof entity_types): string {
  return `Entity Types and Descriptions:\n${entityTypes.map(entity => `**${entity.name}**: ${entity.description}`).join('\n')}`;
}

const prompt_globals = {
  prefix: 'You are a very powerful LLM that builds knowledge graphs and powerful, concise summaries from unstructured data.',
  knowledge_graph_text: fs.readFileSync(path.join(__dirname, './prompts/knowledge-graph.txt'), 'utf-8'),
  entity_descriptions: formatEntityDescriptions(entity_types),
};

class Builder {
  generateTopicPrompt(data: { raw_input: string }): {
    system: string;
    user: string;
  } {
    const prompt_data = { ...prompt_globals, ...data };
    const system = mergeData(
      getPrompt('generate_topics_system.hbs'),
      {...prompt_globals,...prompt_data},
    );
    const user = mergeData(getPrompt('generate_topics_user.hbs'), prompt_data);
    return { system, user };
  }

  generateTopicSummaryPrompt(data: {
    raw_input: string;
    topic: string;
    existing_entities: string[];
    raw_new_entities: string[];
  }): { system: string; user: string } {
    // add entity_types
    const prompt_data = { ...prompt_globals, ...data };

    const system = mergeData(
      getPrompt('generate_topic_summary_system.hbs'),
      prompt_data,
    );
    // add topic, description, raw_input
    const user = mergeData(getPrompt('generate_topic_summary_user.hbs'), prompt_data);
    return { system, user };
  }

  generateSummaryPrompt(data: {
    raw_input: string;
    topic: string;
    existing_entities: string[];
    raw_new_entities: string[];
  }): { system: string; user: string } {
    // add entity_types
    const prompt_data = { ...prompt_globals, ...data };

    const system = mergeData(
      getPrompt('generate_topic_summary_system.hbs'),
      prompt_data,
    );
    // add topic, description, raw_input
    const user = mergeData(getPrompt('generate_topic_summary_user.hbs'), prompt_data);
    return { system, user };
  }

  generateIdentityEntitiesPrompt(data: {
    entity_type: string;
    previous_entities: string[];
    summary: string;
  }): { system: string; user: string } {
    const prompt_data = { ...prompt_globals, ...data };
    const system = mergeData(
      getPrompt('identify_entities_system.hbs'),
      prompt_data,
    );
    const user = mergeData(
      getPrompt('identify_entities_user.hbs'),
      prompt_data,
    );
    return { system, user };
  }


  generateUpdateEntityPrompt(data: { key: string, summaries: string[], existing_entity: string}): { system: string; user: string } {
    const prompt_data = { ...prompt_globals, ...data };
    const system = mergeData(
      getPrompt('update_entity_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('update_entity_user.hbs'), prompt_data);
    return { system, user };
  }

  generateCreateEntityPrompt(data: {key: string, summaries: string[]}): { system: string; user: string } {
    const prompt_data = { ...prompt_globals, ...data };
    const system = mergeData(
      getPrompt('create_entity_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('create_entity_user.hbs'), prompt_data);
    return { system, user };
  }

  generateDocumentSummaryPrompt(prompt_data: { raw_input: string; }): { system: string; user: string } {
    // add entity_types
    const system = mergeData(
      getPrompt('generate_doc_summary_system.hbs'),
      prompt_data,
    );
    // add topic, description, raw_input
    const user = mergeData(getPrompt('generate_doc_summary_user.hbs'), prompt_data);
    return { system, user };
  }
}

export { Builder };
