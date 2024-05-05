import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

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

class Builder {
  generateTopicPrompt(prompt_data: { raw_input: string }): {
    system: string;
    user: string;
  } {
    const system = mergeData(
      getPrompt('generate_topics_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('generate_topics_user.hbs'), prompt_data);
    return { system, user };
  }

  generateSummaryPrompt(prompt_data: {
    raw_input: string;
    topic: string;
    existing_entities: string[];
    raw_new_entities: string[];
  }): { system: string; user: string } {
    const system = mergeData(
      getPrompt('generate_summary_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('generate_summary_user.hbs'), prompt_data);
    return { system, user };
  }

  generateUpdateEntityPrompt(prompt_data: { key: string, summaries: string[], existing_entity: string}): { system: string; user: string } {
    const system = mergeData(
      getPrompt('update_entity_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('update_entity_user.hbs'), prompt_data);
    return { system, user };
  }

  generateCreateEntityPrompt(prompt_data: {key: string, summaries: string[]}): { system: string; user: string } {
    const system = mergeData(
      getPrompt('create_entity_system.hbs'),
      prompt_data,
    );
    const user = mergeData(getPrompt('create_entity_user.hbs'), prompt_data);
    return { system, user };
  }
}

export { Builder };
