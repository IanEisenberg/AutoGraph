import * as fs from 'fs';
import * as path from 'path';
import { TopicData } from './types';

class Exporter {
  public rootLocation: string;
  public runInstance: string;

  constructor(options: { rootLocation?: string, perInstance?: boolean } = { rootLocation: './generated', perInstance: true }) {
    this.rootLocation = options.rootLocation || './';
    this.runInstance = options.perInstance ? `run-${Date.now()}/` : '';
  }

  async exportToFile(filename: string, data: string): Promise<void> {
    const dir = path.join(this.rootLocation, this.runInstance);

    if (!fs.existsSync(dir)){
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(path.join(dir, filename), data);
  }

  async exportTopicSummaries(topics: TopicData): Promise<void> {
    for (const [topic, { summary_text }] of Object.entries(topics)) {
      await this.exportToFile(`${topic}.md`, summary_text);
    }
  }

  async exportUpdatedEntities(updated_entities: Record<string, string>): Promise<void> {
    for (const [entity, summary] of Object.entries(updated_entities)) {
      await this.exportToFile(`${entity}.md`, summary);
    }
  }

  async exportCreatedEntities(created_entities: Record<string, string>): Promise<void> {
    for (const [entity, summary] of Object.entries(created_entities)) {
      await this.exportToFile(`${entity}.md`, summary);
    }
  }


}

export { Exporter };