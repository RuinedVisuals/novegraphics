export interface Track {
  title: string;
  artist: string;
  src: string;
}

// Add your MP3/WAV files to public/audio/ and list them here
export const TRACKS: Track[] = [
  { title: 'The Red Carpet', artist: 'Evidence ft. Raekwon & Ras Kass', src: '/audio/track_01.mp3' },
  { title: 'Priceless Cutlery', artist: 'Jay Royale', src: '/audio/track_02.mp3' },
];
