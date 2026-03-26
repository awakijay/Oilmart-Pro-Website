export interface BotChallenge {
  question: string;
  answer: string;
}

export function createBotChallenge(): BotChallenge {
  const first = Math.floor(Math.random() * 6) + 2;
  const second = Math.floor(Math.random() * 6) + 2;

  return {
    question: `What is ${first} + ${second}?`,
    answer: String(first + second),
  };
}

export function isBotCheckValid(userAnswer: string, expectedAnswer: string, honeypot: string) {
  return !honeypot.trim() && userAnswer.trim() === expectedAnswer.trim();
}
