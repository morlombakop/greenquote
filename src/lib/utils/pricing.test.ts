import { calculateQuote } from './pricing';
import { QuoteInput } from '@/lib/validations/quote';

describe('GreenQuote Pricing Engine Math Rules', () => {
  const baseMockInput: QuoteInput = {
    fullName: 'Morlo',
    email: 'test@test.com',
    address: '123 Solar Lane',
    monthlyConsumptionKwh: 500,
    systemSizeKw: 5,
    downPayment: 1000,
  };

  test('should compute correct baseline System Price and Principal Amount', () => {
    const result = calculateQuote(baseMockInput);

    // 5kW * 1200 = 6000
    expect(result.systemPrice).toBe(6000);
    // 6000 - 1000 downPayment = 5000
    expect(result.principalAmount).toBe(5000);
  });

  test('should assign Risk Band A and 6.9% APR when consumption >= 400 and size <= 6', () => {
    const result = calculateQuote({
      ...baseMockInput,
      monthlyConsumptionKwh: 450,
      systemSizeKw: 4,
    });
    expect(result.riskBand).toBe('A');
    expect(result.offers[0].apr).toBe(6.9);
  });

  test('should assign Risk Band B and 8.9% APR when condition A fails but consumption >= 250', () => {
    const result = calculateQuote({
      ...baseMockInput,
      monthlyConsumptionKwh: 300,
      systemSizeKw: 8, // Triggers alternative path since size > 6
    });
    expect(result.riskBand).toBe('B');
    expect(result.offers[0].apr).toBe(8.9);
  });
});
