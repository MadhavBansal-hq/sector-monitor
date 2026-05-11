import { describe, it, expect, vi } from 'vitest';
import { FintechMetricsSchema, DefenceMetricsSchema, BiotechMetricsSchema } from './metrics';

describe('Metrics Extraction Schemas', () => {
  describe('FintechMetricsSchema', () => {
    it('should validate valid fintech metrics', () => {
      const validMetrics = {
        aum: 50000,
        aumGrowthQoQ: 5.2,
        aumGrowthYoY: 15.8,
        nim: 3.5,
        nimTrend: 'improving',
        grossNPA: 2.1,
        netNPA: 1.2,
        creditCostBPS: 45,
        digitalTransactionVolume: 125.5,
        activeUserCount: 8.7,
        costOfFunds: 4.2,
      };
      
      const result = FintechMetricsSchema.parse(validMetrics);
      expect(result).toEqual(validMetrics);
    });

    it('should allow partial metrics', () => {
      const partialMetrics = {
        aum: 50000,
        nim: 3.5,
        grossNPA: 2.1,
      };
      
      const result = FintechMetricsSchema.parse(partialMetrics);
      expect(result.aum).toBe(50000);
      expect(result.nim).toBe(3.5);
    });

    it('should reject invalid nimTrend values', () => {
      const invalidMetrics = {
        nimTrend: 'invalid',
      };
      
      expect(() => FintechMetricsSchema.parse(invalidMetrics)).toThrow();
    });

    it('should reject additional properties', () => {
      const invalidMetrics = {
        aum: 50000,
        invalidField: 'should fail',
      };
      
      expect(() => FintechMetricsSchema.parse(invalidMetrics)).toThrow();
    });
  });

  describe('DefenceMetricsSchema', () => {
    it('should validate valid defence metrics', () => {
      const validMetrics = {
        orderBookValue: 150000,
        orderBookGrowthYoY: 12.5,
        domesticRevenuePercentage: 65,
        exportRevenuePercentage: 35,
        ebitdaMargin: 18.5,
        ebitdaTrend: 'improving',
        rdSpendPercentage: 5.2,
        newOrderWins: 25000,
        newOrderWinsGeography: 'India, UAE',
        productCategory: 'Defence Systems',
      };
      
      const result = DefenceMetricsSchema.parse(validMetrics);
      expect(result.orderBookValue).toBe(150000);
      expect(result.ebitdaTrend).toBe('improving');
    });

    it('should allow partial defence metrics', () => {
      const partialMetrics = {
        orderBookValue: 150000,
        ebitdaMargin: 18.5,
      };
      
      const result = DefenceMetricsSchema.parse(partialMetrics);
      expect(result.orderBookValue).toBe(150000);
    });
  });

  describe('BiotechMetricsSchema', () => {
    it('should validate valid biotech metrics', () => {
      const validMetrics = {
        pipelineCountPhase1: 5,
        pipelineCountPhase2: 8,
        pipelineCountPhase3: 3,
        pipelineCountNDABLASubmitted: 2,
        totalPipelineCount: 18,
        cashAndEquivalents: 850,
        runwayQuarters: 12,
        revenueByType: {
          productRevenue: 150,
          royaltyRevenue: 25,
          collaborationRevenue: 40,
        },
        clinicalTrialReadouts: [
          {
            programName: 'Program A',
            outcome: 'positive',
            indication: 'Oncology',
          },
        ],
        aiMLInvestment: 'Partnership with AI company X',
      };
      
      const result = BiotechMetricsSchema.parse(validMetrics);
      expect(result.totalPipelineCount).toBe(18);
      expect(result.clinicalTrialReadouts?.[0].outcome).toBe('positive');
    });

    it('should validate clinical trial outcomes', () => {
      const validMetrics = {
        clinicalTrialReadouts: [
          { programName: 'A', outcome: 'positive', indication: 'Oncology' },
          { programName: 'B', outcome: 'negative', indication: 'Cardiology' },
          { programName: 'C', outcome: 'mixed', indication: 'Neurology' },
        ],
      };
      
      const result = BiotechMetricsSchema.parse(validMetrics);
      expect(result.clinicalTrialReadouts).toHaveLength(3);
    });

    it('should reject invalid clinical trial outcomes', () => {
      const invalidMetrics = {
        clinicalTrialReadouts: [
          { programName: 'A', outcome: 'invalid', indication: 'Oncology' },
        ],
      };
      
      expect(() => BiotechMetricsSchema.parse(invalidMetrics)).toThrow();
    });
  });
});
