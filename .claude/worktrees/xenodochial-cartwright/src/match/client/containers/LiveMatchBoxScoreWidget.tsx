'use client';

import { useState } from 'react';
import MatchCompetitorBoxScoreBasicTable from '../components/competitor/MatchCompetitorBoxScoreBasicTable';

export default function LiveMatchBoxScoreWidget() {
  const [tab, setTab] = useState('SCE');

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-6">
        <button onClick={() => { setTab('SCE') }}>
          <span>Cangrejeros</span>
        </button>
        <button onClick={() => { setTab('CAG') }}>
          <span>Criollos</span>
        </button>
      </div>
      <div className="">
        {tab === 'SCE' ? (
          <MatchCompetitorBoxScoreBasicTable team={{ code: 'SCE', nickname: 'Cangrejeros' }} data={[]}/>
        ) : (
          <MatchCompetitorBoxScoreBasicTable team={{ code: 'CAG', nickname: 'Criollos' }} data={[]}/>
        )}
      </div>
    </div>
  );
}
