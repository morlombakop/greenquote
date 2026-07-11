import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateQuotePdf } from './quotePdfUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 1. Create a persistent instance tracking dictionary
const mockPdfInstance = {
  setFillColor: vi.fn().mockReturnThis(),
  rect: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  setFont: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  save: vi.fn().mockReturnThis(),
  lastAutoTable: { finalY: 150 },
};

// 2. Mock jsPDF using a traditional constructible function setup to avoid arrow-function constructor errors
vi.mock('jspdf', () => {
  const MockConstructor = vi.fn(function (this: unknown) {
    return mockPdfInstance;
  });

  return {
    default: MockConstructor,
    jsPDF: MockConstructor,
  };
});

// 3. Mock jspdf-autotable completely to prevent DOM node lookup errors
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('generateQuotePdf utility', () => {
  // Test baseline data fixtures
  const mockQuote = {
    id: 'test-quote-uuid-12345',
    riskBand: 'A',
    fullName: 'Morlo Mbakop',
    email: 'morlo@example.com',
    address: 'Berlin, Germany',
    systemSizeKw: 5.5,
    monthlyConsumptionKwh: 450,
    systemPrice: 6600,
    principalAmount: 6600,
    createdAt: '2026-07-11T12:00:00.000Z',
  };

  const mockOffers = [
    { termYears: 5, apr: 6.9, principalUsed: 6600, monthlyPayment: 130.5 },
    { termYears: 10, apr: 6.9, principalUsed: 6600, monthlyPayment: 76.2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize jsPDF with corporate a4 dimensions', () => {
    generateQuotePdf(mockQuote, mockOffers);

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  });

  it('should paint consumer summary details and branding layouts', () => {
    generateQuotePdf(mockQuote, mockOffers);

    // Verify title branding texts are printed onto the global mock tracking instance
    expect(mockPdfInstance.text).toHaveBeenCalledWith(
      'GreenQuote Financial',
      15,
      25
    );
    expect(mockPdfInstance.text).toHaveBeenCalledWith(
      'Solar Pre-Qualification Certificate',
      15,
      32
    );

    // Verify metadata block coordinate positions are drawn correctly
    expect(mockPdfInstance.text).toHaveBeenCalledWith(
      expect.stringContaining('Issued Date:'),
      145,
      20
    );
    expect(mockPdfInstance.text).toHaveBeenCalledTimes(6);
  });

  it('should call autoTable twice (one for parameters grid, one for financing choices)', () => {
    generateQuotePdf(mockQuote, mockOffers);

    // Assert both the customer summary context grid and financial options table were constructed
    expect(autoTable).toHaveBeenCalledTimes(2);
  });

  it('should securely parse and embed parameters within the summary table array matrix', () => {
    generateQuotePdf(mockQuote, mockOffers);

    // Grab configuration options passed into the first autoTable grid call
    const firstTableCallConfig = vi.mocked(autoTable).mock.calls[0][1];
    const generatedBodyData = firstTableCallConfig?.body;

    expect(generatedBodyData).toBeDefined();

    // Serialize body data directly to securely avoid type-index issues while checking values
    const stringifiedBody = JSON.stringify(generatedBodyData);
    expect(stringifiedBody).toContain('Morlo Mbakop');
    expect(stringifiedBody).toContain('Berlin, Germany');
    expect(stringifiedBody).toContain('Band A');
  });

  it('should save the generated binary stream using a predictable string slug file name structure', () => {
    generateQuotePdf(mockQuote, mockOffers);

    // Assert target naming syntax structure rules match expected output template format
    expect(mockPdfInstance.save).toHaveBeenCalledWith(
      'GreenQuote_Morlo_Mbakop_test-quo.pdf'
    );
  });
});
