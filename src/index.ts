import { InputProcessor } from './processor';
import { OpenAIEngine, FakerEngine, LLM } from './llm';
import dotenv from 'dotenv';
dotenv.config();

const main = async () => {
  // setup dependencies
  const engine = new OpenAIEngine();
//   const engine = new FakerEngine();
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm,  { perInstance: true });

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

  //   // update data
  await processor.exportTopicSummaries(topic_data);
  await processor.exportUpdatedEntities(updated_entities);
  await processor.exportCreatedEntities(created_entities);

  console.log('Input Processor complete.');
};


const tester = async () => {
  // setup dependencies
  const engine = new OpenAIEngine();
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm,  { perInstance: true });

  // get input to process
  const inputs = "the importance of decentralized data ownership versus centralized control, advocating for user control over personal data to prevent exploitation by corporations."

  // generate topics from input
  const topics = await processor.generateTopicsFromInput(inputs);
  console.log('Topics:', topics);
};

tester()
  .then()
  .catch((err) => {
    console.error(err);
  });
