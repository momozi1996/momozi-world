# MoMoZi content expansion · 2026-09-11

## Scope and design
- Preserve the existing 3D island, car, physics, previews, pink/lilac palette and menu layout.
- Enrich the existing About panel with four accessible tabs: 认识我 / 经历 / 开源作品 / 找到我.
- Keep the original Works shortcut as a drive-to-workshop action. Add a catalogue inside About and a Find me shortcut.
- Reuse existing project artwork; no new generic decorative assets or third-party dependencies.
- Sync the island's career text, project attributes and social plaques with the profile.

## Content sources
- User-supplied career order, social handles, project categories, links and directory inclusion list.
- Local résumé supplied by the user: extracted in memory, not copied to the public site.
- Re-fetched public READMEs and project website on 2026-09-11; all returned HTTP 200. Raw public snapshots and URLs are recorded in `content-sources/checks.json`.
- Skills project examples: `awesome-ai-persona-skills`, `yongledadian-skill`.
- Multi-agent decision: `DirectorAgents`, `tianya-skills`.
- Coding agent: `momo-code`, `momozi.cc`; preserve opencode / Pioneer Agent attribution.
- SkillHub, OpenAgentSkill, Skills.Rest, mcpskills.io and ecosyste.ms are included based on the user's explicit statement. No invented listing URLs, endorsements or audience counts.

## Privacy and conservative wording
- Current employer stays “某大模型公司” despite more detail in the résumé.
- No phone, email, date of birth, gender, political affiliation, unpublished model versions, internal product details, customer budgets or private résumé download.
- Dates are taken from the employment/education sections. Both Baidu tracks explicitly share the same employment period; no inferred team-specific dates or claim that one immediately followed the other.
- The medical imaging employment dates follow the résumé's employment section, not its overlapping project dates.
- Papers are summarized conservatively as participation in 10+ SCI papers, not first authorship.
- No fabricated social deep links or QR codes. Copyable account names + explicit search instructions.
- Static star counts removed from 3D metadata; meaningful subject labels replace them.

## Maintenance
- Public content: `site/sources/data/profile.js`.
- Profile rendering and interaction: `site/sources/Game/MomoProfile.js`.
- Core page and style: `site/sources/index.html`, `site/sources/momozi.css`.
- Unmodified originals saved under `research/content-before/` before edits.

## Acceptance checks
- `npm test` from `site/`: 11 passed, 0 failed, 0 skipped (including self-hosted server regression tests).
- `npm run build:online`: production bundle rebuilt successfully. Existing upstream asset-resolution / bundle-size warnings remain; browser verification reported zero HTTP resource errors.
- `node research/content-test.cjs`: passed against the production server on port 5179.
- Desktop 1440×1000, touch viewport 390×844, narrow viewport 320×640.
- Verified four tab panels, keyboard tab navigation, contact dialog focus wrapping, successful clipboard feedback and honest denied-clipboard fallback.
- Verified six career steps, five selected projects in three categories, source links, mobile overflow bounds, map, driving, original workshop navigation and updated 3D metadata.
- Zero page errors, console errors, HTTP errors or failed requests. Screenshots and report: `content-check/`.
