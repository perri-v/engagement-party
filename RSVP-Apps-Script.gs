/**
 * Google Apps Script for the Evan & Perri Engagement Party RSVP form.
 *
 * This script receives POST requests from the invitation website and appends
 * rows to your Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your sheet: https://docs.google.com/spreadsheets/d/1sCBc4JvBo3K6ma1CiF-gntEPR-NrV8pRBKIYfn2WnVE/edit
 * 2. In the sheet, go to Extensions > Apps Script.
 * 3. Delete all the default code in the editor.
 * 4. Paste this entire file's content.
 * 5. (Optional but recommended) Rename the project at the top (click "Untitled project").
 * 6. Click the Save icon (or Ctrl/Cmd + S).
 * 7. Click the "Deploy" button (top right) > "New deployment".
 *    - Deployment type: Web app
 *    - Description: "Engagement Party RSVP Webhook"
 *    - Execute as: Me
 *    - Who has access: Anyone, even anonymous
 * 8. Click "Deploy". Authorize the app the first time (click Advanced > Go to ...).
 * 9. Copy the "Web app URL" (it ends with /exec). This is your GOOGLE_SCRIPT_URL.
 * 10. Paste that URL into the index.html file where it says GOOGLE_SCRIPT_URL.
 *
 * IMPORTANT:
 * - The sheet should have headers in row 1 for the columns below (or the script will just append).
 *   Recommended headers (in this order):
 *   A: Timestamp | B: Attending | C: Name | D: Phone | E: Email | F: Guests | G: Dietary | H: Message
 *
 *   (The doPost function below appends data in exactly this column order)
 *
 * - After any code change, re-deploy (Deploy > Manage deployments > edit the current one > Deploy).
 * - The URL stays the same after re-deploys.
 */

function doPost(e) {
  try {
    // Get the active sheet (or change to .getSheetByName('RSVPs') if you want a specific tab)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the JSON body sent from the website
    var data = JSON.parse(e.postData.contents);

    // Build the row in the order of your sheet columns
    var row = [
      data.timestamp || new Date().toISOString(),  // Timestamp
      data.attending || '',                         // Attending (Yes/No)
      data.name || '',                              // Name
      data.phone || '',                             // Phone / Cell
      data.email || '',                             // Email
      data.guests || '',                            // Guests (number or 0)
      data.dietary || '',                           // Dietary Restrictions
      data.message || ''                            // Message / Note
    ];

    // Append the row
    sheet.appendRow(row);

    // Return a success response (the website uses no-cors, so this is mostly for logging)
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
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
  var testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        attending: 'Yes',
        name: 'Test Person & Guest',
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
