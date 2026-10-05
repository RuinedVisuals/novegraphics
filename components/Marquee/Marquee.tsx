import styles from './Marquee.module.scss';

export const MARQUEE_WORDS = ['DIGGING CULTURE', '黒明澤', 'POSTERS', 'ALBUM ART', 'MERCH', 'BRANDING', 'ATHENS / GR'];

type Props = {
  words?: string[];
  font?: 'anton' | 'display';
  size?: number;
  duration?: number;
};

export default function Marquee({ words = MARQUEE_WORDS, font = 'display', size = 44, duration = 28 }: Props) {
  const run = (key: string) => (
    <div className={styles.run} key={key} aria-hidden={key === 'b'}>
      {words.map((w, i) => (
        <span key={i} className={i % 2 ? styles.red : undefined}>
          {w}&nbsp;&nbsp;✶
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.band}>
      <div
        className={`${styles.track} ${font === 'anton' ? styles.anton : ''}`}
        style={{ fontSize: size, animationDuration: `${duration}s` }}
      >
        {run('a')}
        {run('b')}
      </div>
    </div>
  );
}
