# Sources — provenance for every fact on the site

> Every visible fact on the public site must trace back to one of the rows
> below. When you copy text into `content/*.json`, add the matching `source`
> field so the TL can audit before merging.

## Primary sources

| id | url | type | what we pull from it |
|---|---|---|---|
| `gh-site-home` | https://sites.google.com/edu-herzliya.org.il/democratschoolhr/בית | Google Site | Hero copy, school description, principles summary, principal contact. |
| `gh-site-reg` | https://sites.google.com/edu-herzliya.org.il/democratschoolhr/רישום | Google Site | Registration window, lottery procedure, payment note. |
| `gh-site-contact` | https://sites.google.com/edu-herzliya.org.il/democratschoolhr/צור-קשר | Google Site | Contact card (manager name, email, phone, address). |
| `drive-regulation-pdf` | https://drive.google.com/file/d/177HSHU3hk8VN57UsISMPDHbp-BAXOwYc/view | PDF | "עקרונות חינוך דמוקרטי" — long-form educational principles, quotes, references. |
| `canva-site` | https://democratiherz.my.canva.site/democratiherz | Canva site | Distance-learning hub (מרץ 2026), school schedule, gallery, parent messages, committees. Mostly image-rendered; text scraping only recovers the title and section anchors. Add a card if you need deeper extraction (manual export or canva export-as-pdf route). |

## Canva site caveat

The Canva page (`canva-site`) is mostly image content. Section anchors discovered on the page (each is a navigation link, content is image-rendered):

- `#page-1` על בית הספר
- `#page-2` סדר יום
- `#page-3` אסיפה
- `#page-4` ועדות
- `#page-5` מידע כללי
- `#page-6` מערכת שעות
- `#page-7` מחיי בית הספר
- `#page-8` גלריה
- `#page-9` הודעות ועדכונים
- `#page-a` מערכת למידה מרחוק
- `#page-b` הודעות לקהילה
- `#page-c` פעילויות מרחוק

Two embedded external assets live on this page and should be linked from `parents.html` if relevant:
- Canva presentation: `https://www.canva.com/design/DAHEwOD5MBM/...` (remote-learning schedule)
- YouTube video: `https://www.youtube.com/watch?v=ceB8Py40zSI` (school-life video)

## External links (provided by Assaf, confirmed 2026-09-17)

| id | url | what |
|---|---|---|
| `link-facebook` | https://www.facebook.com/profile.php?id=61555407845738 | Facebook page |
| `link-whatsapp` | (TBD) | WhatsApp — "coming soon" pill in v1 |
| `link-padlet` | (TBD) | Padlet — "coming soon" pill in v1 |

## Reuse rules

- Hebrew text from the Google Site or the PDF can be quoted and adapted;
  do not paraphrase facts in ways that change meaning.
- Quotes attributed to pedagogues (Korzchak, Freire, Robinson, Howard
  Gardner, Hecht) come from the PDF and must keep the attribution.
- Dates of registration, principal name, phone, email, and address must
  match the live Google Site at the time of merge. If the site updates
  and we have not, that is a followup card.