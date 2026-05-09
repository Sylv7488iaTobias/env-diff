/**
 * Categorizes env keys by detected type/purpose based on naming conventions.
 */

export type KeyCategory =
  | 'database'
  | 'auth'
  | 'network'
  | 'feature_flag'
  | 'logging'
  | 'storage'
  | 'email'
  | 'other';

export interface CategorizedKey {
  key: string;
  value: string;
  category: KeyCategory;
}

export interface CategorizerResult {
  categories: Record<KeyCategory, CategorizedKey[]>;
  total: number;
}

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: KeyCategory }> = [
  { pattern: /^(DB_|DATABASE_|POSTGRES_|MYSQL_|MONGO_|REDIS_)/i, category: 'database' },
  { pattern: /^(AUTH_|JWT_|SECRET_|TOKEN_|API_KEY|PASSWORD|OAUTH_)/i, category: 'auth' },
  { pattern: /^(HOST|PORT|URL|ENDPOINT|DOMAIN|BASE_URL|PUBLIC_URL)/i, category: 'network' },
  { pattern: /^(FEATURE_|FLAG_|ENABLE_|DISABLE_)/i, category: 'feature_flag' },
  { pattern: /^(LOG_|LOGGING_|DEBUG|VERBOSE|SENTRY_)/i, category: 'logging' },
  { pattern: /^(S3_|STORAGE_|BUCKET_|CDN_|UPLOAD_)/i, category: 'storage' },
  { pattern: /^(SMTP_|MAIL_|EMAIL_|SENDGRID_|MAILGUN_)/i, category: 'email' },
];

export function categorizeKey(key: string): KeyCategory {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(key)) return category;
  }
  return 'other';
}

export function categorizeEnvMap(envMap: Map<string, string>): CategorizerResult {
  const categories: Record<KeyCategory, CategorizedKey[]> = {
    database: [],
    auth: [],
    network: [],
    feature_flag: [],
    logging: [],
    storage: [],
    email: [],
    other: [],
  };

  for (const [key, value] of envMap.entries()) {
    const category = categorizeKey(key);
    categories[category].push({ key, value, category });
  }

  return { categories, total: envMap.size };
}

export function getCategoryNames(result: CategorizerResult): KeyCategory[] {
  return (Object.keys(result.categories) as KeyCategory[]).filter(
    (cat) => result.categories[cat].length > 0
  );
}
