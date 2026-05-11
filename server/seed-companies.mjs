/**
 * Seed script to populate initial company data
 * Run with: node seed-companies.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const COMPANIES = [
  // Indian Fintech
  { name: 'Bajaj Finance', sector: 'fintech', ticker: 'BAJAJFINSV', exchange: 'NSE' },
  { name: 'SBI Cards', sector: 'fintech', ticker: 'SBICARD', exchange: 'NSE' },
  { name: 'Paytm', sector: 'fintech', ticker: 'PAYTM', exchange: 'NSE' },
  { name: 'PB Fintech', sector: 'fintech', ticker: 'PBFINTECH', exchange: 'NSE' },
  { name: 'CAMS', sector: 'fintech', ticker: 'CAMS', exchange: 'NSE' },
  { name: 'CDSL', sector: 'fintech', ticker: 'CDSL', exchange: 'NSE' },
  { name: 'Zaggle', sector: 'fintech', ticker: 'ZAGGLE', exchange: 'NSE' },
  { name: 'CreditAccess Grameen', sector: 'fintech', ticker: 'CREDITACC', exchange: 'NSE' },
  { name: 'Five Star Business Finance', sector: 'fintech', ticker: 'FIVESTAR', exchange: 'NSE' },
  
  // Indian Defence
  { name: 'HAL', sector: 'defence', ticker: 'HAL', exchange: 'NSE' },
  { name: 'BEL', sector: 'defence', ticker: 'BEL', exchange: 'NSE' },
  { name: 'MTAR Technologies', sector: 'defence', ticker: 'MTAR', exchange: 'NSE' },
  { name: 'Paras Defence', sector: 'defence', ticker: 'PARASDEF', exchange: 'NSE' },
  { name: 'Astra Microwave', sector: 'defence', ticker: 'ASTRATECH', exchange: 'NSE' },
  { name: 'Data Patterns', sector: 'defence', ticker: 'DATAPATTERN', exchange: 'NSE' },
  { name: 'Zen Technologies', sector: 'defence', ticker: 'ZENTECH', exchange: 'NSE' },
  { name: 'Bharat Forge', sector: 'defence', ticker: 'BHARATFORG', exchange: 'NSE' },
  
  // US Biotech
  { name: 'Moderna', sector: 'biotech', ticker: 'MRNA', exchange: 'NASDAQ' },
  { name: 'Regeneron', sector: 'biotech', ticker: 'REGN', exchange: 'NASDAQ' },
  { name: 'Vertex Pharmaceuticals', sector: 'biotech', ticker: 'VRTX', exchange: 'NASDAQ' },
  { name: 'Biogen', sector: 'biotech', ticker: 'BIIB', exchange: 'NASDAQ' },
  { name: 'Illumina', sector: 'biotech', ticker: 'ILMN', exchange: 'NASDAQ' },
  { name: '10x Genomics', sector: 'biotech', ticker: 'TXG', exchange: 'NASDAQ' },
  { name: 'Pacific Biosciences', sector: 'biotech', ticker: 'PACB', exchange: 'NASDAQ' },
  { name: 'Recursion Pharmaceuticals', sector: 'biotech', ticker: 'RXRX', exchange: 'NASDAQ' },
];

async function seedCompanies() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    console.log('Connected to database. Seeding companies...');
    
    for (const company of COMPANIES) {
      const query = 'INSERT INTO companies (name, sector, ticker, exchange) VALUES (?, ?, ?, ?)';
      await connection.execute(query, [company.name, company.sector, company.ticker, company.exchange]);
      console.log(`✓ Added ${company.name}`);
    }
    
    console.log(`\n✅ Successfully seeded ${COMPANIES.length} companies`);
    await connection.end();
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
}

seedCompanies();
