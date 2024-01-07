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
  height: 50rem;
  width: 100%;
  justify-content: center;
  font-size: 2rem;
  color: #c7c7c7;
  text-align: center;
  box-sizing: border-box;
  padding: 20px;

  @media (max-width: 560px) {
    font-size: 1.3rem;
    padding: 50px;
    height: 35rem;
  };
`;

const listGap = 20;

const List = styled.ul<{offset?: number}>`
  transform: translateY(${props => props.offset}px);
  /* transform: translateY(-3700px); */
  transition: 0.6s;
  padding-inline-start: 0;
  word-break: keep-all;
  display: flex;
  flex-direction: column;
  gap: ${listGap}px;
  margin-block-start: 0;
  margin-block-end: 0;
`;

const ListItem = styled.li`
  --lineHeight: 3.5rem;

  list-style-type: none;
  transition: 0.2s;
  /* min-height: var(--lineHeight); */
  /* line-height: var(--lineHeight); */
  &.active {
    color: #fff;
    transform: scale(1.1);
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
    if (lyric[i].timestamp <= timestamp) {
      targetIndex = i;
    }
    else {
      break;
    }
  }

  return targetIndex;
}


function App() {
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lineRefs = lyricData.map(() => useRef<HTMLLIElement>(null));
  const liHeights = useRef<Array<number>>([]);
  const containerHeight = useRef<number>(0);

  console.log('lyric length', lyricData.length);

  useEffect(() => {
    for (let i = 0; i < lyricData.length; ++i) {
      liHeights.current[i] = lineRefs[i].current?.clientHeight || 0;
    }

    containerHeight.current = lyricContainerRef.current?.clientHeight || 0;
  }, []);


  const getOffset = (currentTime: number) => {
    const index = findLyricIndex(lyricData, currentTime);
    let liPosition = 0;
    for (let i = 0; i < index; ++i) {
      liPosition += liHeights.current[i] + listGap;
    }
    const liHeight = liHeights.current[index];
    console.log(liHeight);
    const maxOffset = liHeights.current.reduce((prev, curr) => prev + curr + listGap, 0) - listGap - containerHeight.current;
    console.log(maxOffset);
    let offs = liPosition + liHeight / 2 - containerHeight.current * 1 / 3;
    offs = Math.max(offs, 0);
    offs = Math.min(offs, maxOffset);
    console.log(offs);
    return -offs;
  };

  const [offset, setOffset]  = useState(getOffset(0));
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const index = findLyricIndex(lyricData, event.currentTarget.currentTime);
    setActiveIndex(index);
    const offs = getOffset(event.currentTarget.currentTime);

    setOffset(offs);  
  };
  
  return (
    <AppContainer>
      <PlayerContainer>
        <audio controls src={song} style={{width: '100%'}}  ref={audioRef} onTimeUpdate={handleTimeUpdate} onCanPlay={handleTimeUpdate}/>
      </PlayerContainer>
      <LyricContainer ref={lyricContainerRef}>
        <List offset={offset}>
          {lyricData.map((item, idx) => <ListItem className={idx === activeIndex ? 'active' : ''} key={idx} ref={lineRefs[idx]}>{item.text}</ListItem>)}
        </List>
      </LyricContainer>
    </AppContainer>
  );
}

export default App;
