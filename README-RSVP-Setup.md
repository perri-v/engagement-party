# RSVP to Google Sheet Setup

Your RSVPs from the engagement party website will now be sent directly to this Google Sheet:

**https://docs.google.com/spreadsheets/d/1sCBc4JvBo3K6ma1CiF-gntEPR-NrV8pRBKIYfn2WnVE/edit**

## Quick Steps

1. Open the sheet linked above.
2. Go to **Extensions > Apps Script**.
3. Delete all the default code.
4. Copy everything from the file `RSVP-Apps-Script.gs` (in this folder) and paste it.
5. Save the script (💾 icon or Ctrl/Cmd + S).
6. Click **Deploy** (top right) → **New deployment**.
   - Type: **Web app**
   - Description: `Engagement RSVP Webhook`
   - **Execute as**: Me
   - **Who has access**: Anyone, even anonymous
7. Click **Deploy** and follow the authorization prompts (only the first time).
8. Copy the **Web app URL** (it will look like `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec`).
9. Open `index.html` and replace the value of `GOOGLE_SCRIPT_URL` with the URL you just copied.
10. Save `index.html`. You're done!

## Testing

- Open `index.html` in a browser.
- Click "Will Attend" or "Will Not Attend".
- Fill out and submit the form.
- Check your Google Sheet — the row should appear almost instantly.

## How the Data is Sent

The website sends this JSON structure:

**Will Attend (new multi-guest behavior):**
If the user selects 2+ guests, the form collects separate Name fields.
The script receives a "names" array and writes **one row per name**, repeating phone/email/guests(total)/dietary on every row for that party.
```json
{
  "timestamp": "2026-...",
  "attending": "Yes",
  "names": ["Perri V", "Evan T"],
  "phone": "(555) 555-5555",
  "email": "perri@example.com",
  "guests": "2",
  "dietary": "Vegetarian",
  "message": ""
}
```
→ Results in 2 rows in the sheet (Name column has "Perri V" then "Evan T"; Phone/Email/Guests/Dietary are identical on both).

**Will Not Attend (new multi-guest behavior, symmetric to Yes):**
If the user selects 2+ guests in the decline form, the form collects separate Name fields.
The script receives a "names" array and writes **one row per name**, with attending="No" and the guests total repeated.
```json
{
  "timestamp": "2026-...",
  "attending": "No",
  "names": ["Alex R", "Jordan K"],
  "phone": "",
  "email": "",
  "guests": "2",
  "dietary": "",
  "message": "Sorry we will miss it!"
}
```
→ Results in 2 rows in the sheet (Name has the individual names; Guests="2", attending="No" repeated on both).

The Apps Script appends in this exact column order:
Timestamp | Attending | Name | Phone | Email | Guests | Dietary | Message

## Recommended Sheet Headers (Row 1)

Put these in the first row of your sheet for clarity (8 columns):

| A          | B         | C    | D     | E      | F       | G       | H       |
|------------|-----------|------|-------|--------|---------|---------|---------|
| Timestamp  | Attending | Name | Phone | Email  | Guests  | Dietary | Message |

## Troubleshooting

- **"Script is not authorized"** — Re-deploy and re-authorize.
- **Nothing appears in the sheet** — Check the Apps Script "Executions" tab (left menu) for errors.
- **CORS / fetch errors** — Make sure "Who has access" is set to "Anyone, even anonymous".
- After editing the script, always use **Deploy > Manage deployments** and edit the existing deployment (don't create a brand new one every time, or the URL will change).

The file `RSVP-Apps-Script.gs` contains the exact code and more detailed comments inside it.

Enjoy collecting RSVPs automatically! 🎉
