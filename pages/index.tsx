import { useCallback, useState } from 'react';

export default function IndexPage(): JSX.Element {
  const [pollId, setPollId] = useState<number>(10924113);
  const [option, setOption] = useState<number>(50270630);
  const [votes, setVotes] = useState<number>(100);

  const [loading, setLoading] = useState<boolean>(false);
  const onSubmit = useCallback(async () => {
    setLoading(true);
    const html = await fetch(`https://poll.fm/${pollId}`);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const btn = doc.querySelector('.vote-button');
    const data = JSON.parse(btn.dataset.vote);
    await fetch('https://poll.fm/vote', {
      params: {
        va: 20,
        pt: 0,
        r: 0,
        p: data.p || pollId,
        a: `${option},`,
        o: '',
        t: data.t,
        token: data.n,
        pz: 1,
      },
    });
    setLoading(false);
  });

  return (
    <main>
      <h1>Poll Daddy Hack</h1>
      <p>Easily rack up votes for any Poll Daddy public survey.</p>
      <p>Simply click the "Rack em up!" button and leave this tab open!</p>
      <form onSubmit={onSubmit}>
        <input 
          type='number' 
          label='Poll ID' 
          placeholder='Ex: 10924113' 
          value={pollId} 
          onChange={(e) => setPollId(Number(e.currentTarget.value))} 
        />
        <input 
          type='number' 
          label='Option ID' 
          placeholder='Ex: 50270630' 
          value={option} 
          onChange={(e) => setOption(Number(e.currentTarget.value))} 
        />
        <input
          type='number'
          label='Number of votes',
          placeholder='Ex: 10',
          value={votes}
          onChange={(e) => setVotes(Number(e.currentTarget.value))}
        />
        <button type='submit' label='Rack em up!' disabled={loading} />
      </form>
      <style jsx>{`

      `}</style>
    </main>
  );
}
