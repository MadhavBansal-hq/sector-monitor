import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Data access routers
  companies: router({
    list: publicProcedure.query(async () => {
      const { getCompanies } = await import('./db');
      return getCompanies();
    }),
    bySector: publicProcedure.input(z.string()).query(async ({ input }) => {
      const { getCompanies } = await import('./db');
      return getCompanies(input);
    }),
  }),
  
  metrics: router({
    bySector: publicProcedure.input(z.string()).query(async ({ input }) => {
      const { getMetrics, getCompanies } = await import('./db');
      const companies = await getCompanies(input);
      const allMetrics: any[] = [];
      
      for (const company of companies || []) {
        const companyMetrics = await getMetrics(company.id);
        if (companyMetrics) {
          allMetrics.push(...companyMetrics);
        }
      }
      
      return allMetrics || [];
    }),
  }),
  
  synthesis: router({
    bySector: publicProcedure.input(z.string()).query(async ({ input }) => {
      const { getSynthesis } = await import('./db');
      const result = await getSynthesis(input);
      
      return result || {
        id: 0,
        sector: input,
        period: 'Q1FY24',
        synthesisText: 'Sector synthesis will be generated after initial data ingestion. Check back after the first refresh cycle.',
        investingLensText: 'Investing lens insights will appear here after metrics are extracted and analyzed across the sector companies.',
        generatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
  }),
  
  refresh: router({
    trigger: publicProcedure.input(z.string().optional()).mutation(async ({ input }) => {
      const { refreshSector, refreshAllSectors } = await import('./scheduler/refresher');
      
      if (input && ['fintech', 'defence', 'biotech'].includes(input)) {
        return refreshSector(input as any);
      }
      
      return refreshAllSectors();
    }),
    
    status: publicProcedure.input(z.string().optional()).query(async ({ input }) => {
      const { getRefreshStatus } = await import('./scheduler/refresher');
      return getRefreshStatus(input);
    }),
  }),
});

export type AppRouter = typeof appRouter;
