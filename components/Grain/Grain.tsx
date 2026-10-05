import styles from './Grain.module.scss';

// Global VHS/xerox texture — mounted once in the site layout.
export default function Grain() {
  return (
    <>
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
    </>
  );
}
