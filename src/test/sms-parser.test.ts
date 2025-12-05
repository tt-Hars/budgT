import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseSMS } from '../services/sms-parser';

// Mock fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('SMS Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse SMS successfully', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              amount: 50.00,
              currency: 'USD',
              date: '2023-10-27',
              merchant: 'Target',
              type: 'EXPENSE',
              accountName: 'Chase'
            })
          }
        }
      ]
    };

    globalFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await parseSMS('Spent $50 at Target on my Chase card', 'fake-key');

    expect(result).toEqual({
      amount: 50.00,
      currency: 'USD',
      date: '2023-10-27',
      merchant: 'Target',
      type: 'EXPENSE',
      accountName: 'Chase'
    });

    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledWith(
        "https://api.openai.com/v1/chat/completions",
        expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
                "Authorization": "Bearer fake-key"
            })
        })
    );
  });

  it('should handle API errors', async () => {
    globalFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized'
    });

    await expect(parseSMS('test', 'bad-key')).rejects.toThrow('OpenAI API error: Unauthorized');
  });
});
