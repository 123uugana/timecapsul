function cleanMessage(message) {
  return message.replace(/\s+/g, " ").trim();
}

function firstSentence(message) {
  const [sentence] = cleanMessage(message).split(/(?<=[.!?])\s+/);
  return sentence || cleanMessage(message);
}

export function generateMemoryExperience({ title, message, unlockDate }) {
  const excerpt = firstSentence(message);
  const unlockedYear = new Date(unlockDate).getFullYear();

  return {
    cinematic_narration: `The capsule opens in ${unlockedYear}. A quiet message, once sealed away, returns with the weight of distance and the warmth of recognition. "${excerpt}" becomes the first frame in a memory that waited patiently to be found.`,
    emotional_rewrite: `If this message could speak with the softness of time, it would say: ${cleanMessage(
      message,
    )} Read it slowly. There is care here, and a version of you who believed this moment would matter.`,
    share_card_text: `${title} unlocked today. A message from another moment found its way back. #DigitalTimeCapsule`,
    provider: "local-mvp",
    model: "memory-experience-v0",
  };
}
