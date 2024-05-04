import { Exporter } from '../src/exporter';
import * as fs from 'fs';
import * as path from 'path';

describe('Exporter', () => {
  let exporter: Exporter;
  const rootLocation = './test/generated';

  beforeEach(async () => {
    exporter = new Exporter({ rootLocation, perInstance: true });
  });

  afterEach(async () => {
    try {
      fs.rmdirSync(path.join(rootLocation, exporter.runInstance), { recursive: true });
    } catch (error) {}
  });

  it('should create a new instance of Exporter', () => {
    expect(exporter).toBeInstanceOf(Exporter);
  });

  it('should export data to a file', async () => {
    const filename = 'test.txt';
    const data = 'Test data';
    await exporter.exportToFile(filename, data);
    const filePath = path.join(rootLocation,  exporter.runInstance, filename);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe(data);
  });

  it('should export topic summaries', async () => {
    const topics: any = {
      'Topic 1': {
        topic_input: 'Input 1',
        summary_text: 'Summary 1',
        existing_entities_used: [],
        new_entities: [],
      },
      'Topic 2': {
        topic_input: 'Input 2',
        summary_text: 'Summary 2',
        existing_entities_used: [],
        new_entities: [],
      },
    };
    await exporter.exportTopicSummaries(topics);
    Object.keys(topics).forEach((topic) => {
      const filePath = path.join(rootLocation,  exporter.runInstance, `${topic}.md`);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(topics[topic].summary_text);
    });
  });
});
