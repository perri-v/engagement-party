/**
 * Google Apps Script for the Evan & Perri Engagement Party RSVP form.
 *
 * This script receives POST requests from the invitation website and appends
 * rows to your Google Sheet.
 *
 * NEW RSVP LOGIC (multi-guest support for both Yes and No):
 * - If the website sends "names": ["Perri V", "Evan T"] (array),
 *   the script appends ONE ROW PER NAME (works for both "Yes" and "No" RSVPs).
 * - Every row for that submission shares the same phone, email, guests (total count),
 *   dietary, attending (Yes/No), timestamp, and message.
 * - This means if you select 3 guests and provide 3 names for Will Not Attend,
 *   you get 3 separate rows, each with attending="No" and the guests total repeated.
 * - Legacy single-name posts (old decline or direct) still create exactly 1 row.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your sheet: https://docs.google.com/spreadsheets/d/1sCBc4JvBo3K6ma1CiF-gntEPR-NrV8pRBKIYfn2WnVE/edit
 * 2. In the sheet, go to Extensions > Apps Script.
 * 3. Delete all the default code in the editor.
 * 4. Paste this entire file's content.
 * 5. (Optional but recommended) Rename the project at the top (click "Untitled project").
 * 6. Click the Save icon (or Ctrl/Cmd + S).
 * 7. Click the "Deploy" button (top right) > "New deployment" (or Manage deployments > edit existing to keep same URL).
 *    - Deployment type: Web app
 *    - Description: "Engagement Party RSVP Webhook"
 *    - Execute as: Me
 *    - Who has access: Anyone, even anonymous
 * 8. Click "Deploy". Authorize the app the first time (click Advanced > Go to ...).
 * 9. Copy the "Web app URL" (it ends with /exec). This is your GOOGLE_SCRIPT_URL.
 * 10. Paste that URL into the index.html file where it says GOOGLE_SCRIPT_URL (and re-publish the site if needed).
 *
 * IMPORTANT:
 * - The sheet should have headers in row 1 for the columns below (or the script will just append).
 *   Recommended headers (in this order):
 *   A: Timestamp | B: Attending | C: Name | D: Phone | E: Email | F: Guests | G: Dietary | H: Message
 *
 *   (The doPost function below appends data in exactly this column order)
 *
 * - After any code change, re-deploy using "Manage deployments" → edit the current deployment (keeps the same /exec URL).
 * - The URL stays the same after re-deploys.
 */

function doPost(e) {
  try {
    // Get the active sheet (or change to .getSheetByName('RSVPs') if you want a specific tab)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the JSON body sent from the website
    var data = JSON.parse(e.postData.contents);

    // NEW LOGIC: support "names" array from the website for multi-guest RSVPs (Yes or No).
    // If names is a non-empty array, create one row per name (repeating phone/email/guests/etc).
    // Otherwise fall back to single "name" (used by legacy calls).
    var namesToWrite = [];
    if (data.names && Array.isArray(data.names) && data.names.length > 0) {
      namesToWrite = data.names;
    } else if (data.name) {
      namesToWrite = [data.name];
    }

    var timestamp = data.timestamp || new Date().toISOString();
    var attending = data.attending || '';
    var phone = data.phone || '';
    var email = data.email || '';
    var guests = data.guests || '';
    var dietary = data.dietary || '';
    var message = data.message || '';

    if (namesToWrite.length === 0) {
      // Nothing to write — still append a minimal row so nothing is lost
      namesToWrite = [''];
    }

    namesToWrite.forEach(function (individualName) {
      var row = [
        timestamp,     // A: Timestamp
        attending,     // B: Attending (Yes/No)
        individualName || '',  // C: Name (one person per row)
        phone,         // D: Phone / Cell (repeated for the whole party)
        email,         // E: Email (repeated)
        guests,        // F: Guests (the total number selected in dropdown, repeated)
        dietary,       // G: Dietary Restrictions (repeated)
        message        // H: Message / Note (repeated)
      ];
      sheet.appendRow(row);
    });

    // Return a success response (the website uses no-cors, so this is mostly for logging)
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', rows: namesToWrite.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log the error in the Apps Script execution log (for debugging)
    console.error('RSVP submission error: ' + err);

    // Still return something so the website doesn't hang
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional test function.
 * In the Apps Script editor, run this function to test appending a row.
 * View > Logs or Executions to see results.
 */
function testAppendRow() {
  // Test the new multi-name behavior (sends 2 rows with shared phone/email/etc.)
  var testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        attending: 'Yes',
        names: ['Perri V', 'Evan T'],   // <— array triggers one row per name
        phone: '(123) 456-7890',
        email: 'test@example.com',
        guests: '2',
        dietary: 'Vegetarian',
        message: ''
      })
    }
  };
  return doPost(testData);
}

function testAppendDecline() {
  // Test the multi-name decline path (now sends multiple rows with shared guests count, attending="No")
  var testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        attending: 'No',
        names: ['Alex R', 'Jordan K'],   // <— array triggers one row per name (like Yes)
        phone: '',
        email: '',
        guests: '2',
        dietary: '',
        message: 'Sorry we will miss it!'
      })
    }
  };
  return doPost(testData);
}
