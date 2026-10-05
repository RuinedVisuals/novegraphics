'use client';

import { useState } from 'react';
import styles from './ContactForm.module.scss';

const TYPES = ['POSTER', 'ALBUM ART', 'MERCH', 'BRANDING', 'OTHER'];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [brief, setBrief] = useState('');
  const [types, setTypes] = useState<string[]>(['POSTER']);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const toggle = (t: string) =>
    setTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, types, brief }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not send right now.');
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send right now.');
      setStatus('error');
    }
  }

  function reset() {
    setName('');
    setEmail('');
    setBrief('');
    setTypes(['POSTER']);
    setStatus('idle');
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.head}>
        <span className={styles.red}>NEW BRIEF — FORM 001</span>
        <span>PRINT RUN 01</span>
      </div>

      {status === 'sent' ? (
        <div className={styles.success}>
          <div className={styles.successTitle}>BRIEF <span className={styles.red}>RECEIVED.</span></div>
          <p>Back to you within 48 hours. Start pulling references.</p>
          <button type="button" className={styles.again} onClick={reset}>[ SEND ANOTHER ]</button>
        </div>
      ) : (
        <>
          <div className={styles.pair}>
            <label className={styles.field}>
              <span className={styles.label}>01 / NAME</span>
              <input className={styles.big} required name="name" placeholder="Who's asking" value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>02 / EMAIL</span>
              <input className={styles.big} required type="email" name="email" placeholder="you@crew.com" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
          </div>

          <div className={`${styles.field} ${styles.chipsField}`}>
            <span className={styles.label}>03 / WHAT ARE WE MAKING</span>
            <div className={styles.chips} role="group" aria-label="What are we making">
              {TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={types.includes(t)}
                  className={types.includes(t) ? styles.chipOn : styles.chip}
                  onClick={() => toggle(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className={`${styles.field} ${styles.briefField}`}>
            <span className={styles.label}>04 / THE BRIEF</span>
            <textarea
              rows={5}
              name="brief"
              placeholder="Client, deadline, formats, the vibe — and the references you can't stop looking at…"
              value={brief}
              onChange={e => setBrief(e.target.value)}
            />
          </label>

          <div className={styles.foot}>
            <span>NO SPAM. JUST INK.</span>
            <button type="submit" className={styles.submit} disabled={status === 'sending'}>
              {status === 'sending' ? '[ SENDING… ]' : '[ SEND BRIEF ] →'}
            </button>
          </div>
          {status === 'error' && <p className={styles.error} role="alert">{error}</p>}
        </>
      )}
    </form>
  );
}
