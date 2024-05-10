import { Builder } from '../src/context/builder';

describe('Builder', () => {
  let builder: Builder;

  beforeEach(() => {
    builder = new Builder();
  });

  it('should generate topic prompt', () => {
    const prompt_data = { raw_input: 'This is a test input' };
    const result = builder.generateTopicPrompt(prompt_data);
    expect(result).toBeDefined();
    expect(result.system).toBeDefined();
    expect(result.user).toContain(prompt_data.raw_input);
  });

  it('should generate summary prompt', () => {
    const prompt_data = {
      raw_input: 'This is a test input',
      topic: 'Test Topic',
      existing_entities: ['Entity1', 'Entity2'],
      raw_new_entities: ['Entity3', 'Entity4']
    };
    const result = builder.generateTopicSummaryPrompt(prompt_data);
    expect(result).toBeDefined();
    expect(result.system).toBeDefined();
    expect(result.user).toContain(prompt_data.raw_input);
  });

});

