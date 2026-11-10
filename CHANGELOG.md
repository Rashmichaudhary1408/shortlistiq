# Changelog

All notable changes to ShortlistIQ. Versions follow semantic versioning.

## [1.0.0] - November 2026

First public release.

### Added
- Upload step for a student spreadsheet (.xlsx, .xls, .csv) and resume PDFs, matched by Student ID or the Resume column
- AI skill extraction from a job description, with editable required and preferred skills and optional eligibility hints
- Eligibility rules (CGPA, branches, backlogs, graduation year) that record every failed rule
- Resume scoring: the AI returns evidence only, and a fixed 60/20/20 formula computes the score
- "Basic match" keyword fallback, plus a circuit breaker that skips the AI after three failures in a row
- Ranked results with Top N, manual add and remove, filters with counts, a detail panel and Excel export
- Saved drives in the browser, a home page listing past drives, and a delete confirmation
- Privacy page, share preview card, favicon, `robots.txt`, sitemap and page metadata
- Security headers, request size and per-address rate limits, and a health check that is cached for 60 seconds
- Accessibility work: visible focus, labelled controls, announced progress, reduced-motion support
- 115 automated tests in 20 files, MIT license, setup and environment guides

### Fixed
- Share address (`og:url`) now matches each page
- Spreadsheets with a title line above the headers import correctly
- Resume column values with folders or no ".pdf" ending now match their files
- Basic match no longer uses a regex feature that older Safari cannot parse
- The Top N box can be cleared and retyped
