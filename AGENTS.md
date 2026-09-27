# Creator AI — OpenCode Project Instructions

This repository is a multi-agent hackathon project. The goal is to finish the existing product into one coherent, working Creator AI experience.

## Product north star

Creator context + content understanding + semantic catalog + AI reasoning -> actionable content creation.

## Primary flow

Creator Intelligence -> Discover/Search -> Select content -> Understand content -> AI reasoning -> Creator decision -> Generate content -> Final output -> Save/Project.

## Engineering rules

- Preserve working code.
- Inspect before changing.
- Prefer selective integration over blind branch merges.
- Maintain one canonical implementation per capability.
- Fix broken end-to-end flows before adding new features.
- Do not fabricate capabilities.
- Keep mocks clearly isolated.
- Do not hardcode credentials or secrets.
- Do not perform broad rewrites unless required by a concrete blocker.
- Use the existing project architecture and design system where practical.
- After meaningful changes, run the repository's available typecheck/build/test commands and verify the actual user flow.
- Keep loading, empty, success and error states for critical interactions.
- AI operations should remain creator-controlled where applicable.
- Remove debug artifacts from the final demo.

## Verification

Before declaring completion:
- verify the application starts
- verify the primary flow end-to-end
- verify critical navigation
- verify important API/data connections
- verify build/typecheck/tests
- verify no obvious secret leakage
- clearly report any remaining mocks or limitations.

Do not spend effort on features that do not improve the coherent product or demo unless they are already nearly complete.
