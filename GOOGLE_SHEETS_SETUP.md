# Google Sheets Setup

Follow these steps to connect the form to your Google Sheets:

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Add these headers in Row 1:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Telegram`
   - D1: `X Profile`
   - E1: `Expertise`
   - F1: `Experience Level`
   - G1: `Monthly Rate`
   - H1: `Biggest Win`
   - I1: `Portfolio`

## Step 2: Create a Google Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp,
    data.name,
    data.telegram,
    data.xProfile,
    data.expertise,
    data.experienceLevel,
    data.monthlyRate,
    data.biggestWin,
    data.portfolio
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the project (Ctrl+S or Cmd+S)
4. Name it something like "Stack Daily Form Handler"

## Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon and select **Web app**
3. Set these options:
   - Description: "Stack Daily Form Handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** and follow the prompts
6. Copy the **Web app URL** that appears

## Step 4: Add URL to Your App

1. Create a file called `.env.local` in the project root
2. Add this line with your URL:

```
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

3. Restart the dev server

## Testing

After setup, submit a test form. Check your Google Sheet to verify data is being recorded.

## Troubleshooting

- **CORS errors**: Make sure you deployed with "Who has access: Anyone"
- **No data appearing**: Check the Apps Script execution log (View > Logs)
- **Authorization errors**: Re-deploy the script after any code changes
