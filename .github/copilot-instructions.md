# Praktikplats — AI Agent Instructions

## Project Overview
Full-stack Next.js 16 internship matching platform connecting Danish companies with Swedish candidates. Uses MongoDB, Redux Toolkit, next-intl for i18n (da/en/sv), and a custom peach theme with Tailwind CSS v4.

## Architecture Fundamentals

### File Structure
- **App Router**: `app/[locale]/` with nested layouts; root layout sets fonts, locale layout adds i18n + Redux
- **API Routes**: `app/api/*/route.js` exports `GET`, `POST`, `PUT`, `PATCH`, `DELETE` as async functions
- **Models**: `lib/models/*.js` — Mongoose schemas for User, Application, Internship, CompanyProfile, CandidateProfile, etc.
- **Database**: `lib/db/mongodb.js` — singleton connection with IPv4 priority, retries, and cached conn
- **Auth**: `lib/utils/auth.js` — JWT generation/verification (no middleware folder used; auth checks inline in routes)
- **Components**: `components/` organized by role (`candidate/`, `home/`, `forms/`, `ui/`)
- **Redux Store**: `store/index.js` + `slices/` (auth, contact) wrapped by `StoreProvider.js`

### Key Data Flow
1. User signs up → `/api/auth/signup` → User model created
2. User logs in → `/api/auth/login` → JWT token returned, stored in Redux `authSlice`
3. Forms (`StudentSignupForm.jsx`, `CompanySignupForm.jsx`) call API with `fetch`, handle loading + error states
4. API routes verify token: `verifyToken(request.headers.get('authorization')?.replace('Bearer ', ''))`
5. Applications link `candidateId`, `companyId`, `internshipId` with status enum (`pending`, `reviewed`, `shortlisted`, etc.)

### Internationalization (i18n)
- **Config**: `i18n.js` defines `locales: ['en','da','sv']`, default `'da'`
- **Messages**: `messages/{locale}.json` (keys like `"hero.headline"`)
- **Usage**: `useTranslations('namespace')` from `next-intl`; forms inline translations (`locale === 'da' ? ... : ...`)
- **Routes**: All pages under `app/[locale]/`, static params generated via `generateStaticParams()`
- **Home content**: `app/[locale]/home-content.js` exports `homeContent.da` / `.en` objects for marketing copy

### Styling & Theme
- **Tailwind v4**: `@import "tailwindcss"` in `globals.css`, PostCSS plugin `@tailwindcss/postcss`
- **Custom Theme**: Peach palette — `--primary: #fa8072`, `--background: #fdf5e6`, muted browns — see `:root` in `globals.css`
- **CVA**: `components/ui/button.jsx` uses `class-variance-authority` for variant logic
- **Geist fonts**: `GeistSans.variable` + `GeistMono.variable` applied in root layout
- **Dark mode**: `.dark` class toggles inverted theme (optional)

### Database Patterns
- **Connection**: Always `await connectDB()` before queries; cached singleton prevents multiple connects
- **Models**: Use `mongoose.models.X || mongoose.model('X', schema)` to avoid re-compilation
- **Compound indexes**: e.g., `applicationSchema.index({ internshipId: 1, candidateId: 1 }, { unique: true })`
- **Refs**: Populate related docs: `.populate('companyId', 'companyName logo city')`

### Authentication & Authorization
- **JWT Secret**: `process.env.JWT_SECRET` (fallback in `lib/utils/auth.js` for dev only)
- **Roles**: `candidate`, `company`, `admin` — stored in User schema + JWT payload
- **Token in Redux**: `authSlice` stores `{ user, token, isAuthenticated }`
- **Protected routes**: Check token + role in API route, return 401/403 if invalid
- **No middleware folder**: Auth logic inline; no middleware files in `lib/middleware/`

## Development Workflows

### Starting Development
```pwsh
npm run dev          # http://localhost:3000 (default locale: /da)
```

### Building & Linting
```pwsh
npm run build        # Next.js production build
npm run start        # Serve production build
npm run lint         # ESLint check
```

### Working with MongoDB
- **Env var**: `MONGODB_URI` in `.env.local` (required)
- **Timeout**: 30s connection timeout, 45s socket timeout
- **Debugging**: Logs `🔄 Attempting MongoDB connection...` / `✅ MongoDB connected successfully`

### API Route Pattern
```js
import connectDB from '@/lib/db/mongodb';
import Model from '@/lib/models/Model';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  await connectDB();
  // query logic
  return NextResponse.json({ success: true, data });
}
```

### Form Pattern (Client Component)
```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function MyForm({ locale = 'da' }) {
  const [formData, setFormData] = useState({ ... });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const copy = locale === 'da' ? { ... } : { ... };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/...', { method: 'POST', body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/${locale}/success`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // render form
}
```

## Project-Specific Conventions

### File Naming
- **Route files**: `route.js` (API), `page.jsx` (pages), `layout.jsx` (layouts)
- **Components**: PascalCase (e.g., `StudentSignupForm.jsx`), kebab-case for UI primitives (`back-button.jsx`)
- **Models**: PascalCase (`User.js`, `Application.js`)

### Import Aliases
- `@/` maps to root directory (configured in `jsconfig.json` / Next.js default)
- Example: `import connectDB from '@/lib/db/mongodb';`

### State Management
- **Redux slices**: Action creators exported (`setCredentials`, `logout`, `updateUser`)
- **StoreProvider**: Wraps `NextIntlClientProvider` in locale layout
- **Avoid prop drilling**: Use Redux for user auth, local state for forms

### Error Handling
- **API errors**: Return `NextResponse.json({ error: 'message' }, { status: 4xx/5xx })`
- **Form errors**: Display `<Alert variant="destructive">` with Lucide `AlertCircle` icon
- **Console logs**: Emoji prefixes (`🔐 Login API called`, `❌ Invalid password`)

### Validation
- **Zod**: Dependency exists but minimal usage; most validation is inline or schema-level (Mongoose)
- **React Hook Form**: Available (`react-hook-form`, `@hookform/resolvers`) but not used in signup forms (manual state)
- **Mongoose validators**: `required`, `match`, `enum`, `minlength` in schemas

### Routing & Navigation
- **useParams**: Get `locale` from `[locale]` segment
- **useRouter**: `router.push(\`/${locale}/dashboard/candidate\`)` for programmatic navigation
- **notFound()**: Called in layouts if locale invalid

## Integration Points

### Email (Nodemailer)
- **Setup**: `lib/utils/email.js` (assumed, not in codebase scan)
- **Use case**: Verification emails, password reset tokens
- **Env**: `SMTP_*` variables expected

### File Uploads (Multer)
- **Routes**: `app/api/profile/candidate/upload/route.js`, `app/api/onboarding/upload/route.js`
- **Storage**: Likely `public/uploads/`, served statically
- **Fields**: `attachments` arrays in Application/Onboarding models

### Third-Party Services
- None detected (no Stripe, no external APIs) — fully self-contained platform

## Testing & Debugging

### No Tests Yet
- Project has no test files or scripts; consider adding Jest + React Testing Library
- Models have unit-testable methods (`user.comparePassword`)

### Debugging Tips
- Check API console logs for emoji-prefixed messages (`🔐`, `❌`, `✅`)
- MongoDB connection issues: verify `MONGODB_URI`, check IPv4/IPv6 config
- JWT issues: ensure `JWT_SECRET` env var set, check token expiry (30d default)
- Locale issues: confirm `params.locale` matches `['en','da','sv']`

## Common Tasks

### Adding a New API Route
1. Create `app/api/<resource>/route.js`
2. Import `connectDB`, relevant models, `verifyToken`
3. Export async `GET`/`POST`/etc. functions
4. Call `await connectDB()` at top
5. Verify token if protected: `const decoded = verifyToken(token); if (!decoded) return 401;`
6. Return `NextResponse.json({ success, data/error }, { status })`

### Adding a New Model
1. Create `lib/models/ModelName.js`
2. Define schema with timestamps, indexes, refs
3. Export with `mongoose.models.ModelName || mongoose.model('ModelName', schema)`
4. Import in API routes as needed

### Adding a New UI Component
1. Place in `components/<category>/` (e.g., `components/candidate/NewCard.jsx`)
2. Use Radix UI primitives from `components/ui/` for dialogs, dropdowns, etc.
3. Apply Tailwind classes, respect theme CSS variables (`bg-primary`, `text-foreground`)
4. Export from `components/<category>/index.js` if barrel pattern used

### Adding Translations
1. Add key to `messages/en.json`, `messages/da.json`, `messages/sv.json`
2. Use `useTranslations('namespace')` in component: `const t = useTranslations('hero'); t('headline')`
3. For marketing pages, extend `homeContent` in `app/[locale]/home-content.js`

### Updating Redux State
1. Define action in `store/slices/<slice>.js`: `reducers: { actionName(state, action) { ... } }`
2. Export action: `export const { actionName } = slice.actions;`
3. Dispatch in component: `import { actionName } from '@/store/slices/<slice>'; dispatch(actionName(payload));`

## Critical Files Reference

| File | Purpose |
|------|---------|
| `app/[locale]/layout.jsx` | Locale layout with i18n provider + Redux |
| `app/layout.js` | Root layout (fonts, suppressHydrationWarning) |
| `lib/db/mongodb.js` | Singleton MongoDB connection |
| `lib/utils/auth.js` | JWT helpers (generate, verify) |
| `lib/models/User.js` | User schema with bcrypt + comparePassword |
| `lib/models/Application.js` | Application workflow (status enum, timeline) |
| `store/slices/authSlice.js` | Redux auth state (user, token, isAuthenticated) |
| `app/globals.css` | Tailwind v4 + peach theme variables |
| `i18n.js` | next-intl config (locales, defaultLocale) |
| `app/[locale]/home-content.js` | Marketing copy (da/en), multi-step form config |

## Anti-Patterns to Avoid
- **Don't** hardcode locale strings — use i18n keys or `locale === 'da' ?` ternaries
- **Don't** create middleware files in `lib/middleware/` — project does auth inline
- **Don't** use `any` types — project is JavaScript (no TypeScript)
- **Don't** skip `await connectDB()` — can cause "buffering timed out" errors
- **Don't** mutate Redux state directly — use reducer actions only

## Questions to Ask User
1. Are there specific user roles or permission levels beyond `candidate/company/admin` that need clarification?
2. Should we add automated tests (Jest/Playwright) for critical flows (signup, application submission)?
3. Is there a staging environment or deployment target (Vercel, custom server)?
4. Do you want TypeScript migration for type safety?
5. Are there analytics/monitoring tools (Sentry, Mixpanel) to integrate?
