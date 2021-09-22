import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Bottleneck from 'bottleneck';
import NProgress from 'nprogress';
import { to } from 'await-to-js';

const BOTTLENECK = { maxConcurrent: 100 };

export default function IndexPage(): JSX.Element {
  const [poll, setPoll] = useState<number>(10924113);
  const [option, setOption] = useState<number>(50270630);
  const [votes, setVotes] = useState<number>(1000);

  const [count, setCount] = useState<number>(0);
  const [going, setGoing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  useEffect(() => {
    if (going) {
      NProgress.set(count / votes);
    } else {
      NProgress.done();
    }
  }, [going, count, votes]);
  const limiter = useRef(new Bottleneck(BOTTLENECK));
  useEffect(() => {
    limiter.current.on('done', () => setCount((prev) => prev + 1));
    limiter.current.on('failed', async (error, jobInfo) => {
      setMessage(`Vote (${jobInfo.options.id}) failed: ${error}`);
      if (jobInfo.retryCount < 10) {
        setMessage(`Retrying vote (${jobInfo.options.id}) in 100ms...`);
        return 100;
      }
      return;
    });
    limiter.current.on('retry', (_, jobInfo) => {
      setMessage(`Now retrying vote (${jobInfo.options.id})...`);
    });
  }, [going]);
  const start = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGoing(true);
    setCount(0);
    const url = `/api/poll?poll=${poll}&option=${option}&votes=${votes}`;
    setMessage(`Forging ${votes} votes...`);
    await to(Promise.all(Array(Number(votes)).fill(null).map((_, idx) => limiter.current.schedule({ id: idx.toString() }, () => fetch(url)))));
    setMessage(`Forged ${votes} votes.`);
    setGoing(false);
  }, [poll, option, votes]);
  const stop = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessage(`Canceling ${votes - count} votes...`);
    await to(limiter.current.stop());
    limiter.current = new Bottleneck(BOTTLENECK);
    setMessage(`Canceled ${votes - count} votes.`);
  }, [votes, count]);

  return (
    <main className='wrapper'>
      <header>
        <h1>Poll Daddy Hack</h1>
        <p>Easily rack up votes for any Poll Daddy public survey. Created by <a href='https://nicholaschiang.com' target='_blank' rel='noopener noreferrer'>Nicholas Chiang</a>.</p>
        <p>Simply click the “Start” button, leave this tab open, and watch the votes!</p>
      </header>
      <div className='field'>
        <label htmlFor='poll'>Poll ID</label>
        <input 
          id='poll'
          type='number' 
          placeholder='Ex: 10924113' 
          value={poll} 
          disabled={going}
          onChange={(e) => setPoll(Number(e.currentTarget.value))} 
        />
      </div>
      <div className='field'>
        <label htmlFor='option'>Option ID</label>
        <input
          id='option'
          type='number' 
          placeholder='Ex: 50270630' 
          value={option} 
          disabled={going}
          onChange={(e) => setOption(Number(e.currentTarget.value))} 
        />
      </div>
      <div className='field'>
        <label htmlFor='votes'>Number of votes</label>
        <input
          id='votes'
          type='number'
          placeholder='Ex: 1000'
          value={votes}
          disabled={going}
          onChange={(e) => setVotes(Number(e.currentTarget.value))}
        />
      </div>
      <div className='buttons'>
        <button className='reset' type='button' disabled={going} onClick={start}>Start</button>
        <button className='reset' type='button' disabled={!going} onClick={stop}>Stop</button>
      </div>
      <p>{(count / votes * 100).toFixed(2)}% progress; {count}/{votes} votes forged. <span className='message'>{message}</span></p>
      <style jsx>{`
        main {
          margin: 1rem auto;
        }

        header {
          text-align: center;
          margin: 2rem 0;
        }

        .message {
          color: var(--accents-5);
        }

        .field {
          border: 1px solid var(--accents-2);
          background: var(--accents-1);
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .buttons {
          display: flex;
          margin: 0 0 2rem;
        }

        label {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          display: block;
        }
        
        input {
          border-radius: 4px;
          border: 1px solid var(--accents-2);
          box-shadow: none;
          box-sizing: border-box;
          display: block;
          padding: 1rem;
          font-family: var(--font-sans);
          font-size: 1rem;
          outline: currentcolor none 0px;
          width: 100%;
          color: var(--on-background);
          background-color: transparent;
          caret-color: var(--on-background);
          text-overflow: ellipsis;
          appearance: none;
          transition: border 0.2s ease 0s;
        }

        input:focus,
        input:active {
          border: 1px solid var(--primary);
        }

        button {
          border: 1px solid var(--primary);
          background: var(--primary);
          border-radius: 4px;
          color: var(--on-primary);
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 1.25rem;
          padding: 1rem 2rem;
          margin: 0 0.5rem;
          width: 100%;
          cursor: pointer;
          transition: transform 0.2s ease 0s;
          text-transform: uppercase;
        }

        button:first-child {
          margin-left: 0;
        }

        button:last-child {
          margin-right: 0;
        }

        button:hover {
          transform: scale(.99);
        }

        button:disabled,
        input:disabled {
          cursor: not-allowed;
          border-color: var(--accents-2);
          background: var(--accents-1);
          color: var(--on-background);
          filter: grayscale(1);
          transform: translateZ(0px);
          backface-visibility: hidden;
        }
      `}</style>
    </main>
  );
}
