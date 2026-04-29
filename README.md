# env-diff

> CLI utility to compare `.env` files across environments and flag missing or mismatched keys.

---

## Installation

```bash
npm install -g env-diff
```

Or use it without installing:

```bash
npx env-diff
```

---

## Usage

Compare two `.env` files and see what's different:

```bash
env-diff .env.development .env.production
```

**Example output:**

```
✔  DB_HOST         present in both
✗  API_KEY         missing in .env.production
⚠  LOG_LEVEL       value mismatch (debug vs error)
✗  REDIS_URL       missing in .env.development

2 missing keys, 1 mismatch found.
```

### Options

| Flag              | Description                              |
|-------------------|------------------------------------------|
| `--keys-only`     | Only compare key names, ignore values    |
| `--silent`        | Exit with non-zero code on diff, no output |
| `--format json`   | Output results as JSON                   |

```bash
env-diff .env .env.staging --keys-only
env-diff .env .env.production --format json
```

---

## Why env-diff?

Misconfigured environment variables are a common source of deployment failures. `env-diff` makes it easy to audit `.env` files before shipping to staging or production.

---

## License

[MIT](LICENSE)