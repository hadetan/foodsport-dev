#!/usr/bin/env node
import 'dotenv';
import { prisma } from '../src/lib/prisma/db.js';
import { awardBadgesForActivityProgress, awardPointsBadges } from '../src/lib/badges/ruleEvaluator.js';

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
  const activityId = args.activityId || args.a || null;
  if (!userId) {
    console.error('Usage: npx tsx scripts/evaluate-badges.js --userId <id> [--activityId <id>]');
    process.exit(2);
  }

  try {
    console.log('Running badge evaluation for user:', userId, 'activityId:', activityId);
    const activityAwards = await awardBadgesForActivityProgress(prisma, { userId, activityId });
    console.log('activityAwards:', activityAwards);

    // Points badges can be evaluated separately if you want to test points flows
    const pointsAwards = await awardPointsBadges(prisma, { userId });
    console.log('pointsAwards:', pointsAwards);

    console.log('Done. Check `userBadge` table to confirm new earned badges.');
  } catch (err) {
    console.error('Error running evaluator:', err?.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

// run
run().catch((err) => {
  console.error('Unhandled error in evaluation script:', err?.message || err);
  prisma.$disconnect().finally(() => process.exit(1));
});
