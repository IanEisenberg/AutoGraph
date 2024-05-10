import { InputProcessor } from '../src/processor';
import { LLM, FakerEngine } from '../src/llm';

describe('InputProcessor', () => {
  let processor: InputProcessor;
  let llm: LLM;

  beforeEach(() => {
    llm = new LLM(new FakerEngine());
    processor = new InputProcessor(llm);
  });

  test('getInputs should return a string', () => {
    const result = processor.getInputs();
    expect(typeof result).toBe('string');
  });
  
  test('generateTopicsFromInput should return an array of strings', async () => {
    const raw_input = 'hello world';
    const result = await processor.generateTopicsFromInput(raw_input);
    expect(Array.isArray(result)).toBe(true);
    result.forEach(topic => {
      expect(typeof topic).toBe('string');
    });
  });

  test('generateSummary should return correct summary data', async () => {
    const raw_input = 'hello world';
    const topic = 'test topic';
    const existing_entities = ['entity1', 'entity2'];
    const raw_new_entities = ['new_entity1', 'new_entity2'];
    const result = await processor.generateTopicSummary(raw_input, topic, existing_entities, raw_new_entities);
    expect(typeof result.summary_text).toBe('string');
    expect(Array.isArray(result.existing_entities_used)).toBe(true);
    expect(Array.isArray(result.new_entities)).toBe(true);
  });

  test('processTopics should return correct topics data', async () => {
    const raw_input = 'hello world';
    const topics = ['topic1', 'topic2'];
    const result = await processor.processTopics(raw_input, topics);
    expect(result).toBeInstanceOf(Object);
    for (const topic of topics) {
      const topicData = result[topic];
      expect(typeof topicData.topic_input).toBe('string');
      expect(typeof topicData.summary_text).toBe('string');
      expect(Array.isArray(topicData.existing_entities_used)).toBe(true);
      expect(Array.isArray(topicData.new_entities)).toBe(true);
    }
  });

  test('generateEntitySummaryMap should return correct entity summary map', () => {
    const topicsData = {
      'topic1': {
        topic_input: 'topic1',
        summary_text: 'summary1',
        existing_entities_used: ['entity1'],
        new_entities: ['new_entity1']
      },
      'topic2': {
        topic_input: 'topic2',
        summary_text: 'summary2',
        existing_entities_used: ['entity2'],
        new_entities: ['new_entity2']
      }
    };
    const result = processor.generateEntitySummaryMap(topicsData);
    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('existing_entities');
    expect(result).toHaveProperty('new_entities');
  });

  test('getSummaryFromEntity should return correct summary from entity', () => {
    const topicsData = {
      'topic1': {
        topic_input: 'topic1',
        summary_text: 'summary1',
        existing_entities_used: ['entity1'],
        new_entities: ['new_entity1']
      },
      'topic2': {
        topic_input: 'topic2',
        summary_text: 'summary2',
        existing_entities_used: ['entity2'],
        new_entities: ['new_entity2']
      }
    };
    const summaryKeys = ['topic1', 'topic2'];
    const result = processor.getSummaryFromEntity(topicsData, summaryKeys);
    expect(Array.isArray(result)).toBe(true);
    result.forEach(summary => {
      expect(typeof summary).toBe('string');
    });
  });
});