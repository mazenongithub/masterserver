import transporter from '../functions/mailer.js';

class CivilEngineer {

  async verifyTurnstile(token, ip) {

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip
      })
    }
  );

  return response.json();
}


    async sendContactEmail(values) {
        let { emailaddress, fullname, company, phonenumber, geotechnical, projectmanagement, design, construction, customapp, detail, created } = values
        created = new Date(created).toLocaleTimeString('en-US', {
            timeZone: 'America/Los_Angeles'
        });
        await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: 'mazen@civilengineer.io',
            replyTo: emailaddress,
            subject: 'New Service Request Submission',
            html: `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #333;">
      <h2>New Service Request</h2>

      <p><strong>Name:</strong> ${fullname}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Email:</strong> ${emailaddress}</p>
      <p><strong>Phone:</strong> ${phonenumber || 'N/A'}</p>

      <h3>Services Requested</h3>
      <ul>
        <li>Geotechnical: ${geotechnical ? 'Yes' : 'No'}</li>
        <li>Project Management: ${projectmanagement ? 'Yes' : 'No'}</li>
        <li>Design: ${design ? 'Yes' : 'No'}</li>
        <li>Construction: ${construction ? 'Yes' : 'No'}</li>
        <li>Custom Application: ${customapp ? 'Yes' : 'No'}</li>
      </ul>

      <h3>Project Details</h3>
      <p style="white-space: pre-line;">
        ${detail}
      </p>

      <hr />

      <p style="font-size: 12px; color: #777;">
        This message was generated from the CivilEngineer.io contact form on ${created}.
      </p>
    </div>
  `
        });

    }

    async sendClientEmail(values) {

        let { emailaddress, fullname, company, phonenumber, geotechnical, projectmanagement, design, construction, customapp, detail, created } = values
        created = new Date(created).toLocaleTimeString('en-US', {
            timeZone: 'America/Los_Angeles'
        });
        await transporter.sendMail({
            from: `"CivilEngineer.io" <mazen@civilengineer.io>`,
            to: emailaddress,
            subject: 'We received your service request',
            html: `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #333;">
      <h2>Thank you for contacting CivilEngineer.io</h2>

      <p>Hi ${fullname},</p>

      <p>
        We’ve received your service request and a member of our team will review it shortly.
      </p>

      <h3>Your Request Summary</h3>

      <p><strong>Company:</strong> ${company || 'N/A'}</p>

      <ul>
        <li>Geotechnical: ${geotechnical ? 'Yes' : 'No'}</li>
        <li>Project Management: ${projectmanagement ? 'Yes' : 'No'}</li>
        <li>Design: ${design ? 'Yes' : 'No'}</li>
        <li>Construction: ${construction ? 'Yes' : 'No'}</li>
        <li>Custom Application: ${customapp ? 'Yes' : 'No'}</li>
      </ul>

      <h3>Details</h3>
      <p style="white-space: pre-line;">
        ${detail}
      </p>

      <p>
        If you need to add information, simply reply to this email.
      </p>

      <p>
        — CivilEngineer.io Team
      </p>

      <hr />
      <p style="font-size: 12px; color: #777;">
        This is an automated confirmation created on ${created}. Please do not share sensitive information by email.
      </p>


    </div>
  `
        });

    }

}

export default CivilEngineer;