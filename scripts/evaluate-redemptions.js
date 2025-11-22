#!/usr/bin/env node
import 'dotenv';
import { prisma } from '../src/lib/prisma/db.js';
import { awardRedemptionBadges } from '../src/lib/badges/ruleEvaluator.js';

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

async function run() {
  const args = parseArgs();
  const userId = args.userId || args.u;
  if (!userId) {
    console.error('Usage: npx tsx scripts/evaluate-redemptions.js --userId <id>');
    process.exit(2);
  }

  try {
    console.log('Running redemption evaluation for user:', userId);
    const awards = await awardRedemptionBadges(prisma, { userId });
    console.log('redemptionAwards:', awards);
    console.log('Done. Check `user_badges` table to confirm new earned badges.');
  } catch (err) {
    console.error('Error running redemption evaluator:', err?.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((err) => {
  console.error('Unhandled error in redemption evaluation script:', err?.message || err);
  prisma.$disconnect().finally(() => process.exit(1));
});