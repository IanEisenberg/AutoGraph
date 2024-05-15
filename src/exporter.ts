import * as fs from 'fs';
import * as path from 'path';
import { TopicData } from './types';

// TODO: Make sure exporter doesn't have unintentional name collisions
class Exporter {
  public rootLocation: string;
  public runInstance: string;

  constructor(config: {  outputDir?: string, perInstance?: boolean } = { outputDir: './generated', perInstance: true }) {
    this.rootLocation = process.env.OUTPUT_DIR || config.outputDir || './generated';
    this.runInstance = config.perInstance ? `run-${Date.now()}/` : '';
  }

  async exportToFile(filePath: string, data: string): Promise<void> {
    const fullPath = path.join(this.rootLocation, this.runInstance, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)){
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, data);
  }

  async exportTopicSummaries(topics: TopicData): Promise<void> {
    for (const [topic, { summary_text }] of Object.entries(topics)) {
      await this.exportToFile(`topic/${topic}.md`, summary_text);
    }
  }

  async exportEntities(entities: Record<string, string>): Promise<void> {
    for (const [entity, summary] of Object.entries(entities)) {
      await this.exportToFile(`entity/${entity}.md`, summary);
    }
  }

  async exportDocSummary(doc_summary: string): Promise<void> {
    await this.exportToFile('document_summary.md', doc_summary);
  }

}

export { Exporter };