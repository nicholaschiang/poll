import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import user from 'random-useragent';

export default async function pollAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      const { poll, option } = req.query;
      const headers: Record<string, string> = {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Host': 'poll.fm',
        'Pragma': 'no-cache',
        'Referer': `https://poll.fm/${poll}`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'TE': 'trailers',
        'User-Agent': req.headers['user-agent'] || user.getRandom() || '',
      };
      const resp = await axios.get(`https://poll.fm/${poll}`, { headers });
      headers['Cookie'] = resp.headers['set-cookie'][0].split('; ')[0];
      const doc = new JSDOM(resp.data).window.document;
      const btn = doc.querySelector('.vote-button') as HTMLElement | null;
      const data = JSON.parse(btn?.dataset.vote || '');
      const input = doc.querySelector('input[name="pz"]');
      const pz = (input as HTMLInputElement | null)?.value || 1;
      const url =
        `https://poll.fm/vote?va=${data.at}&pt=${data.m}&r=${data.b}` +
        `&p=${data.id}&a=${option}&o=&t=${data.t}&token=${data.n}&pz=${pz}`;
      await axios.get(url, { headers });
      res.status(200).end();
    } catch (e) {
      res.status(500).json(e);
    }
  }
}
