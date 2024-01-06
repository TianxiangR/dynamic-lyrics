import React, {useEffect, useRef, useState} from 'react';
import { styled, keyframes } from 'styled-components';
import song from './idol.mp3';
import data from './data';
import { logRoles } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

type LyricLine = {
  timestamp: number;
  text: string;
};

const AppContainer = styled.div`
  height: 100vh;
  background: #468acf;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
  box-sizing: border-box;
`;

const PlayerContainer = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  z-index: 10;
`;

const LyricContainer = styled.div`
  overflow: hidden;
  display: flex;
  margin-top: 50px;
  z-index: -10;
  display: flex;
  height: 800px;
  width: 100%;
  justify-content: center;
  font-size: 2rem;
  color: #c7c7c7;
  text-align: center;
  box-sizing: border-box;
`;

const List = styled.ul<{offset?: number}>`
  transform: translateY(${props => props.offset || 0}px);
  transition: 0.6s;
`;

const ListItem = styled.li`
  list-style-type: none;
  transition: 0.2s;
  height: 3.5rem;

  &.active {
    color: #fff;
    transform: scale(1.5);
  }
`;

const timestampRegex = /^\d{2}:\d{2}\.\d{2}$/;

function parseLine(line: string): LyricLine | null {
  const tokens = line.split(']');
  const timeStr = (tokens[0] || '').substring(1);
  const text = tokens[1] || '';

  if (timestampRegex.test(timeStr)) {
    const timeTokens = timeStr.split(':');
    const timestamp = +timeTokens[0] * 60 + +timeTokens[1];

    return {
      timestamp,
      text
    };
  }

  return null;
}

function parseLyric(text: string): Array<LyricLine>
{
  const lines = text.split('\n');
  const output: Array<LyricLine> = [];
  for (const line of lines) {
    const parseResult = parseLine(line);

    if (parseResult) {
      output.push(parseResult);
    }
  }

  return output;
}

const lyricData = parseLyric(data);

function findLyricIndex(lyric: Array<LyricLine>, timestamp: number): number {
  let targetIndex = -1;
  for (let i = 0; i < lyric.length; ++i) {
    if (lyric[i].timestamp <= timestamp - 0.3) {
      targetIndex = i;
    }
    else {
      break;
    }
  }

  return targetIndex;
}

// console.log(lyricData);
// console.log(findLyricIndex(lyricData, 36.50));
// console.log(lyricData[findLyricIndex(lyricData, 35.3)]);

function App() {
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const firstLineRef = useRef<HTMLLIElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);


  const getOffset = (currentTime: number) => {
    const index = findLyricIndex(lyricData, currentTime);
    const liHeight = firstLineRef.current?.clientHeight || 0;
    const containerHeight = lyricContainerRef.current?.clientHeight || 0;
    const maxOffset = liHeight * lyricData.length - containerHeight;
    let offs = liHeight * index + liHeight / 2 - containerHeight * 1 / 3;
    offs = Math.max(offs, 0);
    // offs = Math.min(offs, maxOffset);

    return -offs;
  };

  const [offset, setOffset]  = useState(getOffset(0));
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const index = findLyricIndex(lyricData, event.currentTarget.currentTime);
    setActiveIndex(index);
    const offs = getOffset(event.currentTarget.currentTime);
    console.dir(offs);
    setOffset(offs);  
  };

  
  return (
    <AppContainer>
      <PlayerContainer>
        <audio controls src={song} style={{width: '100%'}}  ref={audioRef} onTimeUpdate={handleTimeUpdate} onCanPlay={handleTimeUpdate}/>
      </PlayerContainer>
      <LyricContainer ref={lyricContainerRef}>
        <List offset={offset}>
          {lyricData.map((item, idx) => idx == 0 ? <ListItem key={idx} ref={firstLineRef} className={idx === activeIndex ? 'active' : ''}>{item.text}</ListItem> : <ListItem className={idx === activeIndex ? 'active' : ''} key={idx}>{item.text}</ListItem>)}
        </List>
      </LyricContainer>
    </AppContainer>
  );
}

export default App;
