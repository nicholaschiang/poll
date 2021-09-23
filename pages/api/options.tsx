import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import user from 'random-useragent';

export interface Option {
  id: string;
  label: string;
}

export default async function optionsAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      const { poll } = req.query;
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
      const doc = new JSDOM(resp.data).window.document;
      const options: Option[] = [];
      doc.querySelectorAll('.pds-answer-row').forEach((el) => {
        options.push({ 
          id: el.querySelector('input')?.value || '',
          label: el.querySelector('.pds-answer-span')?.textContent || '',
        });
      });
      res.status(200).json(options);
    } catch (e) {
      res.status(500).json(e);
    }
  }
}
