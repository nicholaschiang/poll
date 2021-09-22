import { FormEvent, useCallback, useEffect, useState } from 'react';
import NProgress from 'nprogress';

export default function IndexPage(): JSX.Element {
  const [pollId, setPollId] = useState<number>(10924113);
  const [option, setOption] = useState<number>(50270630);
  const [votes, setVotes] = useState<number>(100);

  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);
  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const headers = {
      'Access-Control-Allow-Origin': 'https://poll.fm',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Host': 'poll.fm',
      'Pragma': 'no-cache',
      'Referer': `https://poll.fm/${pollId}`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'TE': 'trailers',
    };
    console.log('Headers:', headers);
    const res = await fetch(`https://poll.fm/${pollId}`, { headers });
    console.log('Response:', res);
    const html = await res.text();
    console.log('HTML:', html);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    console.log('Doc:', doc);
    const btn = doc.querySelector('.vote-button');
    console.log('Button:', btn);
    const data = JSON.parse((btn as HTMLElement | null)?.dataset.vote || '');
    console.log('Data:', data);
    const input = doc.querySelector('input[name="pz"]');
    console.log('Input:', input);
    const pz = (input as HTMLInputElement | null)?.value || 1;
    console.log('PZ:', pz);
    const url =
      `https://poll.fm/vote?va=${data.at}&pt=${data.m}&r=${data.b}` +
      `&p=${data.id}&a=${option}&o=&t=${data.t}&token=${data.n}&pz=${pz}`;
    console.log('URL:', url);
    await fetch(url, { headers });
    setLoading(false);
  }, [option, pollId]);

  return (
    <main className='wrapper'>
      <header>
        <h1>Poll Daddy Hack</h1>
        <p>Easily rack up votes for any Poll Daddy public survey.</p>
        <p>Simply click the “Rack em up!” button and leave this tab open!</p>
      </header>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor='poll'>Poll ID</label>
          <input 
            id='poll'
            type='number' 
            placeholder='Ex: 10924113' 
            value={pollId} 
            onChange={(e) => setPollId(Number(e.currentTarget.value))} 
          />
        </div>
        <div>
          <label htmlFor='option'>Option ID</label>
          <input
            id='option'
            type='number' 
            placeholder='Ex: 50270630' 
            value={option} 
            onChange={(e) => setOption(Number(e.currentTarget.value))} 
          />
        </div>
        <div>
          <label htmlFor='votes'>Number of votes</label>
          <input
            id='votes'
            type='number'
            placeholder='Ex: 10'
            value={votes}
            onChange={(e) => setVotes(Number(e.currentTarget.value))}
          />
        </div>
        <button className='reset' type='submit' disabled={loading}>Rack em up!</button>
      </form>
      <style jsx>{`
        main {
          margin: 1rem auto;
        }

        header {
          text-align: center;
          margin: 2rem 0;
        }

        form div {
          border: 1px solid var(--accents-2);
          background: var(--accents-1);
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
        }

        form div:first-of-type {
          margin-top: 2rem;
        }

        form div:last-of-type {
          margin-bottom: 2rem;
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
          width: 100%;
          cursor: pointer;
          transition: transform 0.2s ease 0s;
          text-transform: uppercase;
        }

        button:hover {
          transform: scale(.99);
        }

        button:disabled {
          cursor: wait;
          border-color: var(--accents-2);
          background: var(--accents-1);
          filter: grayscale(1);
          transform: translateZ(0px);
          backface-visibility: hidden;
        }
      `}</style>
    </main>
  );
}
