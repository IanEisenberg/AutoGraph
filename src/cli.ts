import cliProgress from 'cli-progress';
import { Command } from 'commander';
import dotenv from 'dotenv';

import config from './config.json';
import { OpenAIEngine, LLM } from './llm';
import { InputProcessor } from './processor';
import { logger } from './utils';

// env vars
dotenv.config();

// progress bar
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: ' {bar} | {filename} | {value}/{total}',
}, cliProgress.Presets.shades_grey);


// main program
const processor = async (filepath: string, options: any) => {
  // setup dependencies
  const processorConfig = {
    outputDir: config.outputLocation,
    perInstance: false,
  };

  const engine = new OpenAIEngine(options.model); 
  const llm = new LLM(engine);
  const processor = new InputProcessor(llm, processorConfig);

  // get input to process
  const inputs = processor.getInputs(filepath);

  // add progress bars
  const topicsBar = multibar.create(1, 0, { filename: 'Generating Topics' });

  // generate topics from input
  const topics = await processor.generateTopicsFromInput(inputs);
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
  await processor.exportEntities(updated_entities);


  // stop all bars
  multibar.stop();
  console.log('Program Complete');
};

// cli interpreter
const program = new Command();
program
  .name('autograph-ci')
  .description('AutoGraph CLI to process input files and generate summaries')
  .version('1.0.0');

program.command('process')
  .description('Process an input file and generate summaries')
  .argument('<filepath>', 'path to the input file')
  .option('-m, --model <model>', 'model to use', 'gpt-4o')
  .action(processor);

program.parse(process.argv);
