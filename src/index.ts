import { InputProcessor } from './processor';
import { OpenAIEngine, OllamaEngine, FakerEngine, LLM } from './llm';
import config from './config.json';
import dotenv from 'dotenv';
import { logger } from './utils';
dotenv.config();

const main = async () => {
  // setup dependencies
  const processorConfig = {
    outputDir: config.outputLocation,
    perInstance: true,
  };

  const engine = new OpenAIEngine();
  //   const engine = new FakerEngine();
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm, processorConfig);

  // get input to process
  const file = 'data/2023-05-25 - Salon_Relationships_transcript_processed_anon.txt';
  const inputs = processor.getInputs(file);
  //   console.log('Inputs:', inputs);

  // generate topics from input
  const topics = await processor.generateTopicsFromInput(inputs);
  console.log('Topics:', topics);

  // process topics for each topic generate summaries
  const topic_data = await processor.processTopics(inputs, topics);
  console.log('Topic Data:', topic_data);

  // generate entitity-summary map
  const { existing_entities, new_entities } = processor.generateEntitySummaryMap(topic_data);
  console.log('Existing Entities:', existing_entities);
  console.log('New Entities:', new_entities);

  // update each new or updated entity
  const { updated_entities, created_entities } = await processor.processEntities(topic_data, existing_entities, new_entities);
  console.log('Updated Entities:', updated_entities);
  console.log('Created Entities:', created_entities);

  // Create final document node
  const doc_summary = await processor.generateDocumentSummary(inputs, 'TO BE FILLED with formatted topic_data');

  //   // update data
  await processor.exportTopicSummaries(topic_data);
  await processor.exportEntities(updated_entities);
  await processor.exportEntities(created_entities);
  await processor.exportDocSummary(doc_summary);

  console.log('Input Processor complete.');
};


const tester = async () => {
  // setup dependencies
  const processorConfig = {
    outputDir: config.outputLocation,
    perInstance: false,
  };

  const engine = new OpenAIEngine('gpt-4o'); 
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm, processorConfig);

  // get input to process
  const file = 'data/sam_test.txt';
  const inputs = processor.getInputs(file);
  //   // generate topics from input
  //   const topics = await processor.generateTopicsFromInput(inputs);
  //   console.log(topics);
  //   console.log('Topics:', topics);

  const topics_1 = [
    {
      topic_name: 'Need for Protocol over Network in AI',
      description: 'Sam expresses the necessity of creating AI protocols over networks to foster innovation and diverse application, giving rise to products like Tiny Cloud.'
    },
  ];
  // process topics for each topic generate summaries
  const topic_data = await processor.processTopics(inputs, [topics_1[0]]);
  logger.log('Topic Data:', topic_data);
  

  // generate entity-summary map
  const { existing_entities, new_entities } = processor.generateEntitySummaryMap(topic_data);
  logger.log('Existing Entities:', existing_entities);
  logger.log('New Entities:', new_entities);

  // update each new or updated entity
  const { updated_entities, created_entities } = await processor.processEntities(topic_data, existing_entities, new_entities);
  logger.log('Updated Entities:', updated_entities);
  logger.log('Created Entities:', created_entities);

  // update data
  await processor.exportTopicSummaries(topic_data);
  await processor.exportEntities(created_entities);

};

tester()
  .then()
  .catch((err) => {
    console.error(err);
  });
