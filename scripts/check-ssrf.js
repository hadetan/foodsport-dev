const { isSafeImageUrl, getAllowedImageOriginsFromEnv } = require('../src/lib/ssrf-protection');

async function run() {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.foodsport.test/storage';
  process.env.NEXT_PUBLIC_SUPABASE_URL = env;
  console.log('Allowed origins from env:', getAllowedImageOriginsFromEnv());
  const toTest = [
    'https://supabase.foodsport.test/storage/images/ride.jpg',
    'http://169.254.169.254/latest/meta-data/',
    'http://127.0.0.1/private',
    'http://localhost/loop',
    'https://example.com/image.png',
  ];

  for (const u of toTest) {
    const ok = await isSafeImageUrl(u, getAllowedImageOriginsFromEnv());
    console.log(u, '=>', ok);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
