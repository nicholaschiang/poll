import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Bottleneck from 'bottleneck';
import NProgress from 'nprogress';
import { to } from 'await-to-js';
import useSWR from 'swr';

import { Option } from 'pages/api/options';

import Empty from 'components/empty';

const BOTTLENECK = { maxConcurrent: 100 };

export default function IndexPage(): JSX.Element {
  const [poll, setPoll] = useState('https://poll.fm/10924113');
  const pollId = useMemo(() => poll.split('https://poll.fm/').pop(), [poll]);
  
  const [option, setOption] = useState(50270630);
  const [votes, setVotes] = useState(1000);

  const [count, setCount] = useState(0);
  const [going, setGoing] = useState(false);
  const [message, setMessage] = useState('');
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
    const url = `/api/poll?poll=${pollId}&option=${option}`;
    setMessage(`Forging ${votes} votes...`);
    await to(Promise.all(Array(votes).fill(null).map((_, idx) => limiter.current.schedule({ id: idx.toString() }, () => fetch(url)))));
    setMessage(`Forged ${votes} votes.`);
    setGoing(false);
  }, [pollId, option, votes]);
  const stop = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMessage(`Canceling ${votes - count} votes...`);
    await to(limiter.current.stop());
    limiter.current = new Bottleneck(BOTTLENECK);
    setMessage(`Canceled ${votes - count} votes.`);
  }, [votes, count]);

  const { data } = useSWR<Option[]>(`/api/options?poll=${pollId}`);

  return (
    <main className='wrapper'>
      <header>
        <h1>Crowd Signal Hack</h1>
        <p>Easily rack up votes for any Crowd Signal (previously Poll Daddy) public survey.</p>
        <p>Simply click the “Start” button, leave this tab open, and watch the votes!</p>
        <p>Created by <a href='https://nicholaschiang.com' target='_blank' rel='noopener noreferrer'>Nicholas Chiang</a> because it was just too easy. 😎😤</p>
      </header>
      <div className='field'>
        <label htmlFor='poll'>Poll URL</label>
        <input 
          id='poll'
          type='url' 
          className='textfield'
          placeholder='Ex: https://poll.fm/10924113' 
          value={poll} 
          disabled={going}
          onChange={(e) => setPoll(e.currentTarget.value)} 
        />
      </div>
      <ul className='field options'>
        <label>Option</label>
        {data && data.map(({ id, label }) => (
          <li key={id}>
            <input
              id={id}
              type='radio' 
              value={id} 
              disabled={going}
              className='radio'
              checked={option === Number(id)}
              onChange={() => setOption(Number(id))} 
            />
            <label htmlFor={id}>{label}</label>
          </li>
        ))}
        {!data && Array(5).fill(null).map((_, idx) => <li key={idx} className='loading' />)}
        {data && !data.length && <Empty>Enter a valid poll URL above to get started.</Empty>}
      </ul>
      <div className='field'>
        <label htmlFor='votes'>Number of votes</label>
        <input
          id='votes'
          type='number'
          className='textfield'
          placeholder='Ex: 1000'
          value={votes}
          disabled={going}
          onChange={(e) => setVotes(Number(e.currentTarget.value))}
        />
      </div>
      <div className='buttons'>
        <button 
          className='reset' 
          type='button' 
          disabled={going || !data?.some((d) => Number(d.id) === option)} 
          onClick={start}
        >
          Start
        </button>
        <button 
          className='reset' 
          type='button' 
          disabled={!going} 
          onClick={stop}
        >
          Stop
        </button>
      </div>
      <p>{(count / votes * 100).toFixed(2)}% progress; {count}/{votes} votes forged. <span className='message'>{message}</span></p>
      <style jsx>{`
        main {
          margin: 2rem auto;
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

        ul {
          list-style: none;
        }

        ul :global(.empty) {
          margin-top: 1rem;
          height: ${1.25 * 5 + 1 * 4}rem;
        }

        li {
          display: flex;
          align-items: center;
          margin: 1rem 0;
          height: 1.25rem;
        }

        li.loading {
          width: 100%;
          border-radius: 4px;
        }

        li:last-child {
          margin-bottom: 0;
        }

        li label,
        li .radio {
          margin: 0;
          text-transform: unset;
        }

        .radio {
          position: absolute;
          opacity: 0;
        }
        .radio + label:before {
          content: '';
          background: var(--accents-1);
          border-radius: 100%;
          border: 1px solid var(--accents-2);
          display: inline-block;
          width: 1rem;
          height: 1rem;
          position: relative;
          top: 0.25rem;
          margin-right: 0.75rem; 
          vertical-align: top;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease 0s;
        }
        .radio:checked + label:before {
          background-color: var(--primary);
          box-shadow: inset 0 0 0 4px var(--accents-1);
          border-color: var(--primary);
          outline: none;
        }
        .radio:disabled + label:before {
          border-color: var(--accents-2);
          background: var(--accents-1);
          filter: grayscale(1);
          cursor: not-allowed;
        }
        .radio:checked:disabled + label:before {
          background-color: var(--accents-2);
        }
        .radio + label:empty:before {
          margin-right: 0;
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
        
        .textfield {
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

        .textfield:focus,
        .textfield:active {
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
