import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/utils/email';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, formData } = body;

    if (!type || !formData) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Recipient email from environment
    const recipientEmail = process.env.EMAIL_USER;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, message: 'Email configuration error' },
        { status: 500 }
      );
    }

    let emailHtml = '';
    let subject = '';

    if (type === 'quick') {
      // Quick contact form
      const { email, consent } = formData;

      if (!email || !consent) {
        return NextResponse.json(
          { success: false, message: 'Email and consent are required' },
          { status: 400 }
        );
      }

      subject = '🚀 New Quick Contact Request - Denmark Intern';
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fdf5e6 0%, #ffefd5 100%); padding: 40px 20px; border-radius: 12px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #fa8072; margin: 0; font-size: 28px;">📧 Quick Contact Request</h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(to right, #ffa07a, #fa8072); margin: 15px auto;"></div>
            </div>
            
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #fa8072; margin-bottom: 20px;">
              <p style="color: #4a3728; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Contact Details</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #ffefd5;">
                  <strong style="color: #6b5444;">📧 Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #ffefd5; text-align: right;">
                  <a href="mailto:${email}" style="color: #fa8072; text-decoration: none; font-weight: 500;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #ffefd5;">
                  <strong style="color: #6b5444;">✅ Consent Given:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #ffefd5; text-align: right;">
                  <span style="background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Yes</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #6b5444;">🕒 Received:</strong>
                </td>
                <td style="padding: 12px 0; text-align: right;">
                  <span style="color: #6b5444;">${new Date().toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; border: 2px dashed #0070f3;">
              <p style="color: #0070f3; margin: 0; font-size: 14px; font-weight: 600;">💡 Action Required</p>
              <p style="color: #6b5444; margin: 10px 0 0 0; font-size: 14px;">Please respond to this employer as soon as possible.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #6b5444; font-size: 12px; margin: 0;">Denmark Intern Platform • Connecting Talent Across Borders 🇩🇰 ↔️ 🇸🇪</p>
          </div>
        </div>
      `;
    } else if (type === 'full') {
      // Full 6-step contact form - ALL fields captured
      const {
        // Step A: Company & Contact Information
        companyName,
        cvr,
        website,
        companyAddress,
        industry,
        companySize,
        primaryContactName,
        primaryContactTitle,
        email,
        phone,
        preferredLanguage,
        
        // Step B: Role & Project Scope
        areas,
        otherArea,
        topTasks,
        tools,
        otherTools,
        expectedDeliverables,
        accessLevel,
        ndaRequired,
        
        // Step C: Logistics & Timing
        workMode,
        onsiteLocation,
        onsiteExpectation,
        weeklyHours,
        duration,
        startWindow,
        supervisionCapacity,
        remoteTools,
        equipment,
        
        // Step D: Candidate Profile
        academicLevel,
        fieldsOfStudy,
        languages,
        mustHaveSkills,
        niceToHaveSkills,
        softSkills,
        workAuthorization,
        drivingLicense,
        
        // Step E: Preferences & Screening
        internsPlanned,
        interviewFormat,
        interviewAvailability,
        decisionSpeed,
        budget,
        priorityCriteria,
        diversityNotes,
        accessibility,
        
        // Step F: Compliance, Consent & Extras
        authorized,
        consent,
        acceptPolicies,
        preferredDocs,
        attachments,
        additionalNotes,
      } = formData;

      if (!email || !companyName) {
        return NextResponse.json(
          { success: false, message: 'Email and company name are required' },
          { status: 400 }
        );
      }

      // Helper function to format arrays
      const formatArray = (arr) => arr && arr.length > 0 ? arr.join(', ') : 'Not specified';
      const formatChips = (arr) => arr && arr.length > 0 
        ? arr.map(item => `<span style="background: #fa8072; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; display: inline-block; margin: 2px;">${item}</span>`).join(' ')
        : '<span style="color: #999;">Not specified</span>';

      subject = '🎯 New Full Match Request (6-Step Form) - Denmark Intern';
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #fdf5e6 0%, #ffefd5 100%); padding: 40px 20px; border-radius: 12px;">
          <div style="background: white; padding: 35px; border-radius: 8px; box-shadow: 0 6px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 35px;">
              <h1 style="color: #fa8072; margin: 0; font-size: 32px;">🎯 Comprehensive Match Request</h1>
              <div style="width: 100px; height: 4px; background: linear-gradient(to right, #ffa07a, #fa8072); margin: 15px auto;"></div>
              <p style="color: #6b5444; margin: 10px 0 0 0; font-size: 16px;">Complete 6-Step Internship Details</p>
              <p style="color: #8b7355; margin: 5px 0 0 0; font-size: 13px;">Received: ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}</p>
            </div>
            
            <!-- Step A: Company & Contact Information -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #fa8072; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">🏢 A. Company & Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">Company Name:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${companyName || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">CVR Number:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${cvr || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Website:</strong></td>
                  <td style="padding: 10px 0;">${website ? `<a href="${website}" style="color: #fa8072; text-decoration: none;">${website}</a>` : 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Company Address:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${companyAddress || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Industry:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${industry || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Company Size:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${companySize || 'Not provided'}</td>
                </tr>
                <tr style="border-top: 2px solid #ffe4b5;">
                  <td style="padding: 10px 0; padding-top: 15px; vertical-align: top;"><strong style="color: #6b5444;">Primary Contact Name:</strong></td>
                  <td style="padding: 10px 0; padding-top: 15px; color: #4a3728;">${primaryContactName || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Contact Title:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${primaryContactTitle || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">📧 Email:</strong></td>
                  <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #fa8072; text-decoration: none; font-weight: 600;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">📱 Phone:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Preferred Language:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${preferredLanguage === 'en' ? 'English' : preferredLanguage === 'da' ? 'Danish' : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Step B: Role & Project Scope -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #ffa07a; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">💼 B. Role & Project Scope</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">Area(s) Needed:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(areas)}</td>
                </tr>
                ${otherArea ? `
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Other Area:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${otherArea}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Top 3 Tasks:</strong></td>
                  <td style="padding: 10px 0;">${formatChips(topTasks)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Tools / Stack:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(tools)}</td>
                </tr>
                ${otherTools ? `
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Other Tools:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${otherTools}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Expected Deliverables:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(expectedDeliverables)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Access Level:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(accessLevel)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">NDA Required:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${ndaRequired === 'yes' ? 'Yes' : ndaRequired === 'no' ? 'No' : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Step C: Logistics & Timing -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #e9967a; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">📋 C. Logistics & Timing</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">🏠 Work Mode:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${workMode || 'Not specified'}</td>
                </tr>
                ${onsiteLocation ? `
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">📍 On-site Location:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${onsiteLocation}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">On-site Expectation:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${onsiteExpectation || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">⏱️ Weekly Hours:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${weeklyHours || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Duration:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${duration || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">📅 Start Window:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${startWindow || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Supervision Capacity:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${supervisionCapacity || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Remote Tools:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(remoteTools)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Equipment Provided:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(equipment)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Step D: Candidate Profile -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #cd853f; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">👤 D. Candidate Profile</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">Academic Level:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${academicLevel || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Field(s) of Study:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(fieldsOfStudy)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Languages:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(languages)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">⭐ Must-Have Skills:</strong></td>
                  <td style="padding: 10px 0;">${formatChips(mustHaveSkills)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Nice-to-Have Skills:</strong></td>
                  <td style="padding: 10px 0;">${formatChips(niceToHaveSkills)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Soft Skills:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(softSkills)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Work Authorization:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${workAuthorization || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Driving License Required:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${drivingLicense === 'yes' ? 'Yes' : drivingLicense === 'no' ? 'No' : 'Not specified'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Step E: Preferences & Screening -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #d2691e; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">🎯 E. Preferences & Screening</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">Interns Planned:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${internsPlanned || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Interview Format:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(interviewFormat)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Interview Availability:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${interviewAvailability || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">⚡ Decision Speed:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${decisionSpeed || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">💰 Budget / Allowance:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${budget || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Priority Criteria:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(priorityCriteria)}</td>
                </tr>
                ${diversityNotes ? `
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Diversity & Inclusion:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728; white-space: pre-wrap;">${diversityNotes}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">♿ Accessibility:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${accessibility === 'yes' ? 'Yes' : accessibility === 'no' ? 'No' : 'To be discussed'}</td>
                </tr>
              </table>
            </div>
            
            <!-- Step F: Compliance, Consent & Extras -->
            <div style="background: linear-gradient(135deg, #ffefd5 0%, #ffe5b4 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #8b4513; margin-bottom: 25px;">
              <h2 style="color: #4a3728; margin: 0 0 18px 0; font-size: 20px;">✅ F. Compliance, Consent & Extras</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; width: 45%; vertical-align: top;"><strong style="color: #6b5444;">Authorized to Engage:</strong></td>
                  <td style="padding: 10px 0;">${authorized ? '<span style="background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ Yes</span>' : '<span style="color: #999;">Not confirmed</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Consent to Contact:</strong></td>
                  <td style="padding: 10px 0;">${consent ? '<span style="background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ Yes</span>' : '<span style="color: #999;">Not confirmed</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Accepts Policies:</strong></td>
                  <td style="padding: 10px 0;">${acceptPolicies ? '<span style="background: #d1fae5; color: #047857; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ Yes</span>' : '<span style="color: #999;">Not confirmed</span>'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;"><strong style="color: #6b5444;">Preferred Legal Docs:</strong></td>
                  <td style="padding: 10px 0; color: #4a3728;">${formatArray(preferredDocs)}</td>
                </tr>
                ${additionalNotes ? `
                <tr>
                  <td colspan="2" style="padding: 15px 0; padding-top: 20px; border-top: 2px solid #ffe4b5;">
                    <strong style="color: #6b5444; display: block; margin-bottom: 8px;">📝 Additional Notes:</strong>
                    <p style="color: #4a3728; margin: 0; line-height: 1.6; white-space: pre-wrap;">${additionalNotes}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${attachments && attachments.length > 0 ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
              <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📎 Attachments</h2>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                ${attachments.map(file => `<li style="margin: 5px 0;">${file}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- Action Required -->
            <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; border: 2px solid #10b981;">
              <p style="color: #047857; margin: 0; font-size: 18px; font-weight: 700;">✅ Action Required</p>
              <p style="color: #065f46; margin: 12px 0 0 0; font-size: 14px; line-height: 1.6;">
                This is a <strong>complete 6-step match request</strong> with comprehensive details. Review all sections carefully and respond to the employer within 24-48 hours. This employer has provided extensive information about their internship opportunity and is serious about finding the right match.
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding: 25px;">
            <p style="color: #6b5444; font-size: 13px; margin: 0; line-height: 2;">
              <strong style="font-size: 15px;">Denmark Intern Platform</strong><br>
              Connecting Talent Across Borders 🇩🇰 ↔️ 🇸🇪<br>
              Building the Øresund Bridge for Internships
            </p>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid contact type' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html: emailHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully! We will get back to you soon.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
