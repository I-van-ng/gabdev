/**
 * Sends a message to the backend Gemini proxy API and returns an async generator for streaming the response.
 */
export const sendMessageToGemini = async (
  message: string,
  history: { role: "user" | "model"; text: string }[],
) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error('Erreur de communication avec le serveur IA.');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  return {
    async *[Symbol.asyncIterator]() {
      let buffer = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine.startsWith('data: ')) continue;
          const dataStr = cleanLine.substring(6);
          if (dataStr === '[DONE]') return;

          try {
            const data = JSON.parse(dataStr);
            yield data;
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  };
};

/**
 * Sends a topic to the backend to generate a structured learning path.
 */
export const generateLearningPath = async (topic: string) => {
  const response = await fetch('/api/ai/learning-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error("Erreur de génération de parcours d'apprentissage.");
  }

  return await response.json();
};

/**
 * Sends thread information to the backend to generate a community reply.
 */
export const generateCommunityReply = async (
  contextType: "post" | "comment",
  titleOrUserComment: string,
  postContent?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/ai/community-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextType, titleOrUserComment, postContent }),
    });

    if (!response.ok) {
      return "Je suis là pour vous aider ! 🪐 Antigravity";
    }

    const data = await response.json();
    return data.reply || "Je suis là pour vous aider ! 🪐 Antigravity";
  } catch (error) {
    console.error("Error generating community reply:", error);
    return "Je suis là pour vous aider ! 🪐 Antigravity";
  }
};
