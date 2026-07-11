import { beforeEach, describe, expect, it, vi } from 'vitest';

const getGenerativeModelMock = vi.hoisted(() => vi.fn(() => ({ id: 'gemini-model' })));
const googleGenerativeAiMock = vi.hoisted(() =>
  vi.fn(
    class GoogleGenerativeAI {
      getGenerativeModel = getGenerativeModelMock;
    },
  ),
);

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: googleGenerativeAiMock,
}));

describe('Gemini singleton', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    vi.resetModules();
    googleGenerativeAiMock.mockClear();
    getGenerativeModelMock.mockClear();
  });

  it('initializes the Gemini model once per module load', async () => {
    const geminiLib = await import('@/lib/gemini');

    expect(googleGenerativeAiMock).toHaveBeenCalledTimes(1);
    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1);
    expect(geminiLib.geminiModel).toEqual({ id: 'gemini-model' });
    expect(geminiLib.geminiModel).toBe(geminiLib.geminiModel);
  });
});
