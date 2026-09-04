import type { Language } from '../types';

class VoiceAlertService {
  private enabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public announce(hubName: string, demandLevel: string, language: Language = 'hinglish') {
    if (!this.enabled || !('speechSynthesis' in window)) return;

    const now = Date.now();
    if (this.lastSpokenText === hubName && now - this.lastSpokenTime < 30000) {
      return;
    }

    this.lastSpokenText = hubName;
    this.lastSpokenTime = now;

    let text = '';
    let voiceLang = 'hi-IN';

    if (language === 'hi') {
      text = `ध्यान दें! ${hubName} पर बहुत ज़्यादा सवारियां इंतज़ार कर रही हैं। तुरंत जाएं!`;
      voiceLang = 'hi-IN';
    } else if (language === 'hinglish') {
      text = `Attention! ${hubName} pe high demand hai. Wahan ${demandLevel === 'SURGE' ? 'badi bheed' : 'kaafi customers'} khade hain.`;
      voiceLang = 'hi-IN';
    } else {
      text = `Attention Driver! High passenger demand detected at ${hubName}. Immediate pickups available!`;
      voiceLang = 'en-IN';
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceAlerts = new VoiceAlertService();
