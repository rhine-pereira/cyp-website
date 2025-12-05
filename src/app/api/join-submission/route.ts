import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

// Add your Google Sheet ID here
const SHEET_ID = '1ed3DawNs7Sva_-KFnMdEzWpVaPgiKUqQpj9-41V9gxc';

// Email recipients - add as many as you need
const EMAIL_RECIPIENTS = [
  process.env.EMAIL_RECIPIENT_1,
  process.env.EMAIL_RECIPIENT_2,
  process.env.EMAIL_RECIPIENT_3,
  process.env.EMAIL_RECIPIENT_4,
  process.env.EMAIL_RECIPIENT_5,
].filter(Boolean); // Remove undefined values

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, number, instaId, ageGroup, gender } = body;

    // Validate required fields
    if (!name || !number || !ageGroup || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Google Sheets API
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString('utf-8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const row = [name, number, instaId || '', ageGroup, gender, timestamp];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'responses!A:F', // Adjust sheet name if needed
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    // Send email notification
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FB923C; color: #1C1917; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin: 15px 0; padding: 10px; background-color: white; border-left: 4px solid #FB923C; }
            .label { font-weight: bold; color: #FB923C; }
            .value { margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New CYP Registration</h1>
            </div>
            <div class="content">
              <p>A new member has registered to join CYP Vasai!</p>
              
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">Phone Number:</div>
                <div class="value">${number}</div>
              </div>
              
              <div class="field">
                <div class="label">Instagram ID:</div>
                <div class="value">${instaId || 'Not provided'}</div>
              </div>
              
              <div class="field">
                <div class="label">Age Group:</div>
                <div class="value">${ageGroup}</div>
              </div>
              
              <div class="field">
                <div class="label">Gender:</div>
                <div class="value">${gender}</div>
              </div>
              
              <div class="field">
                <div class="label">Registration Time:</div>
                <div class="value">${timestamp}</div>
              </div>
              
              <div class="footer">
                <p>This is an automated notification from CYP Vasai website</p>
                <p>Visit: <a href="https://cypvasai.org">cypvasai.org</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"CYP Vasai" <${process.env.SMTP_USER}>`,
        to: EMAIL_RECIPIENTS.join(', '),
        subject: `New Registration: ${name}`,
        html: emailHtml,
        text: `New CYP Registration\n\nName: ${name}\nPhone: ${number}\nInstagram: ${instaId || 'Not provided'}\nAge Group: ${ageGroup}\nGender: ${gender}\nTime: ${timestamp}`,
      });

      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the entire request if email fails
    }

    return NextResponse.json(
      { message: 'Registration successful!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    );
  }
}
