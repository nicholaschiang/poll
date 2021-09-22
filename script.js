const axios = require('axios');
const progress = require('cli-progress');
const Bottleneck = require('bottleneck');

const URL = 'https://polldaddy.vercel.app/api/poll?poll=10924113&option=50270636';

async function script(total = 1000) {
  console.log(`Voting ${total} times...`);
  const limiter = new Bottleneck({ maxConcurrent: 100 });
  let count = 0;
  const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
  bar.start(total, count);
  limiter.on('done', () => bar.update((count += 1)));
  limiter.on('failed', async (error, jobInfo) => {
    console.error(`Job (${jobInfo.options.id}) failed:`, error);
    if (jobInfo.retryCount < 10) {
      console.log(`Retrying job (${jobInfo.options.id}) in 100ms...`);
      return 100;
    }
  });
  limiter.on('retry', (error, jobInfo) => {
    console.log(`Now retrying job (${jobInfo.options.id})...`);
  });
  await Promise.all(Array(total).fill(null).map(
    (_, id) => limiter.schedule({ id }, axios.get, URL)
  ));
  bar.stop();
  console.log(`Voted ${count}/${total} times.`);
}

script();
