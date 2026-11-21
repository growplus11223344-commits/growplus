import { RewardsEngine } from '../src/services/rewardsEngine';
import { supabaseAdmin } from '../src/config/supabase';

describe('Rewards Engine Compliance & Audit Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('RewardsEngine should be defined and expose processOrderReward and reverseOrderReward', () => {
    expect(RewardsEngine.processOrderReward).toBeDefined();
    expect(RewardsEngine.reverseOrderReward).toBeDefined();
  });

  it('RewardsEngine.reverseOrderReward should handle gracefully when no credited rewards exist', async () => {
    // Mock Supabase call to return empty list
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => callback({ data: [], error: null })),
    } as any);

    await expect(
      RewardsEngine.reverseOrderReward({
        orderId: '00000000-0000-0000-0000-000000000000',
        reason: 'Test cancellation',
      })
    ).resolves.not.toThrow();
  });

  it('RewardsEngine.processOrderReward should gracefully handle non-existent order', async () => {
    // Mock Supabase call to return order not found
    jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    } as any);

    await expect(
      RewardsEngine.processOrderReward({
        orderId: '00000000-0000-0000-0000-000000000000',
        userId: '00000000-0000-0000-0000-000000000001',
      })
    ).resolves.not.toThrow();
  });
});
