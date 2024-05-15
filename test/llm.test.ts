import { LLM, OpenAIEngine, FakerEngine } from '../src/llm';


// Mocking fs and path for Jest
jest?.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

jest?.mock('path', () => ({
  join: jest.fn().mockReturnValue('mocked/log/path.txt'),
}));


describe('LLM', () => {
  let llm: LLM;
  let systemPrompt: string;
  let userPrompt: string;

  beforeEach(() => {
    systemPrompt = 'Assist the user with their query. Answer briefly and concisely.';
    userPrompt = 'What is a good snack if I am hungry?';
  });

  //   describe('with OpenAIEngine', () => {
  //     beforeEach(() => {
  //       llm = new LLM(new OpenAIEngine());
  //     });

  //     test('generate returns a string', async () => {
  //       const result = await llm.generate(systemPrompt, userPrompt);
  //       expect(typeof result).toBe('string');
  //     });
  //   });

  describe('with FakerEngine', () => {
    beforeEach(() => {
      llm = new LLM(new FakerEngine());
    });

    test('generate returns a string', async () => {
      const result = await llm.generate(systemPrompt, userPrompt);
      expect(typeof result).toBe('string');
    });
  });
});
