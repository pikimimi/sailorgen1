// /lib/cityPopGenerator.ts
import { Midi } from '@tonejs/midi';

class CityPopGenerator {
  private chordProgressions = [
    ['CM7', 'Am7', 'Dm7', 'G7'],
    ['FM7', 'Bm7b5', 'E7', 'Am7'],
    ['Dm7', 'G7', 'CM7', 'Am7'],
    ['Bm7b5', 'E7', 'Am7', 'D7'],
  ];

  private chordToNotes = {
    'CM7': [60, 64, 67, 71],
    'Am7': [57, 60, 64, 67],
    'Dm7': [62, 65, 69, 72],
    'G7': [55, 59, 62, 65],
    'FM7': [53, 57, 60, 64],
    'Bm7b5': [59, 62, 65, 69],
    'E7': [52, 56, 59, 62],
    'D7': [62, 66, 69, 72],
  };

  private generateTensionArc(length: number): number[] {
    return Array(length).fill(0).map((_, i) => Math.sin(i / length * Math.PI));
  }

  private createVoicing(root: number, template: string, complexity: number): number[] {
    return this.chordToNotes[template as keyof typeof this.chordToNotes] || [];
  }

  private calculateVelocityMod(index: number, length: number, tension: number): number {
    return 0.8 + (tension * 0.2);
  }

  public generateMidiFile(): { data: Uint8Array; tempo: number } {
    const midi = new Midi();
    const track = midi.addTrack();
    
    const length = 8;
    const tensionArc = this.generateTensionArc(length);
    const tempo = 85 + Math.random() * 40;
    
    midi.header.setTempo(tempo);
    track.channel = 0;
    
    let prevRoot: number | null = null;
    let time = 0;
    
    for (let i = 0; i < length; i++) {
      const progression = this.chordProgressions[Math.floor(Math.random() * this.chordProgressions.length)];
      const chord = progression[i % progression.length];
      const root = this.chordToNotes[chord as keyof typeof this.chordToNotes][0];
      const template = chord;
      const complexity = Math.random();
      
      const notes = this.createVoicing(root, template, complexity);
      const timingFeel = Math.max(0, (Math.random() * 0.04));
      const velocityMod = this.calculateVelocityMod(i, length, tensionArc[i]);
      
      for (const note of notes) {
        const baseVelocity = Math.floor(85 * velocityMod);
        const velocity = Math.min(100, Math.max(60, 
          baseVelocity + (Math.floor(Math.random() * 11) - 5)
        ));
        
        const duration = Math.max(0.1, 2 + (Math.random() * 0.3) - 0.1);
        
        track.addNote({
          midi: Math.max(0, note),
          time: time + timingFeel,
          duration: duration,
          velocity: velocity / 127
        });
      }
      
      time += 2;
      prevRoot = root;
    }

    return {
      data: midi.toArray(),
      tempo: tempo
    };
  }
}

export const generateAndDownloadMidi = () => {
  const generator = new CityPopGenerator();
  const { data, tempo } = generator.generateMidiFile();

  const blob = new Blob([data], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const filename = `city-pop-progression-${Math.round(tempo)}bpm.mid`;

  return { url, filename };
};
