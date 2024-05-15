import { InputProcessor } from './processor';
import { OpenAIEngine, OllamaEngine, FakerEngine, LLM } from './llm';
import config from './config.json';
import dotenv from 'dotenv';
import { logger } from './utils';
import cliProgress from 'cli-progress';
import { Console } from 'console';

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

  // retrieve entities
  const retrieved_entities = await processor.getExistingEntities(processorConfig.outputDir);

  // generate topics from input
  const topics = await processor.generateTopicsFromInput(inputs);
  console.log('Topics:', topics);

  // process topics for each topic generate summaries
  const topic_data = await processor.processTopics(inputs, topics, retrieved_entities);
  console.log('Topic Data:', topic_data);

  // generate entitity-summary map
  const { existing_entities, new_entities } = processor.generateEntitySummaryMap(topic_data);
  console.log('Existing Entities:', existing_entities);
  console.log('New Entities:', new_entities);

  // update each new or updated entity
  const { updated_entities, created_entities } = await processor.processEntities(topic_data, existing_entities, new_entities, retrieved_entities);
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

// create new container
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} | {filename} | {value}/{total}',
}, cliProgress.Presets.shades_grey);

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

  // add progress bars
  const topicsBar = multibar.create(1, 0, { filename: 'Generating Topics' });


  // fake data
  const topics = [
    {
      topic_name: 'Need for Protocol over Network in AI',
      description: 'Sam expresses the necessity of creating AI protocols over networks to foster innovation and diverse application, giving rise to products like Tiny Cloud.'
    },
  ];
  // generate topics from input
  // const topics = await processor.generateTopicsFromInput(inputs);
  topicsBar.increment(1);
  logger.log('Topics', topics);

  // retrieve entities
  const retrieved_entities = await processor.getExistingEntities(processorConfig.outputDir);


  // process topics for each topic generate summaries
  const summariesBar = multibar.create(topics.length, 0, { filename: 'Generating Summaries' });
  const updateSummaryProgress = () => summariesBar.increment(1);
  const topic_data = await processor.processTopics(inputs, topics, retrieved_entities, updateSummaryProgress);

  logger.log('Topic Data:', topic_data);

  // generate entity-summary map
  const { existing_entities, new_entities } = processor.generateEntitySummaryMap(topic_data);
  logger.log('Existing Entities:', existing_entities);
  logger.log('New Entities:', new_entities);

  // progress calculation
  const numEntities = Object.keys(existing_entities).length +  Object.keys(new_entities).length;
  const entitiesBar = multibar.create(numEntities, 0, { filename: 'Generating Entity Summaries' });
  const updateEntityProgress = () => entitiesBar.increment(1);

  // update each new or updated entity
  const { updated_entities, created_entities } = await processor.processEntities(topic_data, existing_entities, new_entities, retrieved_entities, updateEntityProgress);
  logger.log('Updated Entities:', updated_entities);
  logger.log('Created Entities:', created_entities);

  // update data
  await processor.exportTopicSummaries(topic_data);
  await processor.exportEntities(created_entities);

  // stop all bars
  multibar.stop();
  console.log('Program Complete');
};



const tester2 = async () => {
  function formatKnownEntities(entities: string[]): string {
    const groupedEntities: { [prefix: string]: string[] } = {};
  
    entities.forEach(entity => {
      const [prefix, name] = entity.split('/');
      if (!groupedEntities[prefix]) {
        groupedEntities[prefix] = [];
      }
      groupedEntities[prefix].push(name.replace('.md', ''));
    });
  
    let formattedText = '';
    for (const prefix in groupedEntities) {
      formattedText += `${prefix}: `;
      formattedText += groupedEntities[prefix].join(', ');
      formattedText += '\n';
    }
  
    return `KNOWN ENTITIES:\n${formattedText}`;
  }
  
  // setup dependencies
  const processorConfig = {
    outputDir: config.outputLocation,
    perInstance: false,
  };

  const engine = new OpenAIEngine('gpt-4o'); 
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm, processorConfig);

  // retrieve data
  const existing_entities = await processor.getExistingEntities(processorConfig.outputDir);
  logger.log('existing_entities', existing_entities);

  const entity_data = await processor.fetchEntity(existing_entities[0]);
  logger.log('entity_data', entity_data);

  const formatted = formatKnownEntities(existing_entities);
  logger.log(formatted);


};


tester2()
  .then()
  .catch((err) => {
    console.error(err);
  });
