import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import CompanyProfile from '@/lib/models/CompanyProfile';
import CandidateProfile from '@/lib/models/CandidateProfile';
import Internship from '@/lib/models/Internship';
import User from '@/lib/models/User';

// Calculate match percentage based on shared skills, availability, and location
function calculateMatchPercentage(role, candidate) {
  let score = 0;
  let totalWeight = 100;

  // Skills matching (40% weight)
  // Role uses: mustHaveSkills, niceToHaveSkills
  // Candidate uses: skills
  const roleSkills = [...(role.mustHaveSkills || []), ...(role.niceToHaveSkills || [])];
  const candidateSkills = candidate.skills || [];
  
  if (roleSkills.length > 0 && candidateSkills.length > 0) {
    const matchingSkills = roleSkills.filter(skill =>
      candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())
    );
    const skillsScore = (matchingSkills.length / roleSkills.length) * 40;
    score += skillsScore;
  }

  // Work mode matching (20% weight)
  // Role uses: workMode (string)
  // Candidate uses: workMode (array of strings)
  const candidateWorkModes = Array.isArray(candidate.workMode) ? candidate.workMode : [candidate.workMode];
  if (role.workMode && candidateWorkModes.length > 0) {
    if (candidateWorkModes.includes(role.workMode) || 
        candidateWorkModes.includes('hybrid') || 
        role.workMode === 'hybrid') {
      score += 20;
    } else {
      score += 10; // Partial match
    }
  } else {
    score += 10; // Default if not specified
  }

  // Location matching (15% weight)
  const roleCity = role.location?.city?.toLowerCase();
  const candidateCity = candidate.city?.toLowerCase();
  
  if (roleCity && candidateCity) {
    if (roleCity === candidateCity) {
      score += 15;
    } else if (role.workMode === 'remote' || candidateWorkModes.includes('remote')) {
      score += 10; // Partial match for remote
    }
  } else {
    score += 7; // Default if not specified
  }

  // Education level matching (15% weight)
  // Role uses: academicLevel (array)
  // Candidate uses: degree or academicLevel
  const roleEducation = role.academicLevel || [];
  const candidateDegree = candidate.degree || candidate.academicLevel || '';
  
  if (roleEducation.length > 0 && candidateDegree) {
    if (roleEducation.includes(candidateDegree)) {
      score += 15;
    } else if (
      (candidateDegree === 'master' && roleEducation.includes('bachelor')) ||
      (candidateDegree === 'bachelor' && roleEducation.includes('master'))
    ) {
      score += 10; // Close match
    }
  } else {
    score += 7; // Default if not specified
  }

  // Availability matching (10% weight)
  // Role uses: weeklyHours (string like "21-30")
  // Candidate uses: weeklyHours (string like "21-30")
  if (role.weeklyHours && candidate.weeklyHours) {
    if (role.weeklyHours === candidate.weeklyHours) {
      score += 10;
    } else {
      // Parse and compare ranges
      const roleHoursMatch = role.weeklyHours.match(/(\d+)-?(\d+)?/);
      const candHoursMatch = candidate.weeklyHours.match(/(\d+)-?(\d+)?/);
      
      if (roleHoursMatch && candHoursMatch) {
        const roleMin = parseInt(roleHoursMatch[1]);
        const candMin = parseInt(candHoursMatch[1]);
        
        if (Math.abs(roleMin - candMin) <= 10) {
          score += 5; // Partial match if within 10 hours
        }
      }
    }
  } else {
    score += 5; // Default if not specified
  }

  return Math.round(Math.min(score, 100)); // Cap at 100%
}

export async function GET(request) {
  try {
    await dbConnect();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check URL params for specific role
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    // Find company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    console.log('🔍 Matching debug - Company ID:', companyProfile._id);

    // If roleId is provided, get matches for that specific role
    if (roleId) {
      const internship = await Internship.findById(roleId);
      
      if (!internship) {
        return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
      }

      if (internship.companyId.toString() !== companyProfile._id.toString()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      console.log('🔍 Matching debug - Internship:', {
        title: internship.title,
        mustHaveSkills: internship.mustHaveSkills,
        niceToHaveSkills: internship.niceToHaveSkills,
        workMode: internship.workMode,
        location: internship.location,
        academicLevel: internship.academicLevel,
        weeklyHours: internship.weeklyHours
      });

      // Get all candidate profiles
      const candidateProfiles = await CandidateProfile.find()
        .populate('userId', 'firstName lastName email');

      console.log('🔍 Matching debug - Total candidates:', candidateProfiles.length);

      const matches = [];

      for (const candidateProfile of candidateProfiles) {
        console.log('🔍 Checking candidate:', {
          name: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
          skills: candidateProfile.skills,
          workMode: candidateProfile.workMode,
          city: candidateProfile.city,
          degree: candidateProfile.degree,
          weeklyHours: candidateProfile.weeklyHours
        });

        const matchPercentage = calculateMatchPercentage(internship, candidateProfile);
        console.log('🔍 Match percentage:', matchPercentage);

        // Only include matches above 50%
        if (matchPercentage >= 50) {
          matches.push({
            _id: `${internship._id}_${candidateProfile._id}`,
            role: {
              _id: internship._id,
              title: internship.title,
              department: internship.department || internship.area?.[0] || 'Other',
              location: internship.location,
            },
            candidate: {
              _id: candidateProfile._id,
              firstName: candidateProfile.firstName || candidateProfile.userId?.firstName || 'Unknown',
              lastName: candidateProfile.lastName || candidateProfile.userId?.lastName || '',
              email: candidateProfile.email || candidateProfile.userId?.email,
              phone: candidateProfile.phone,
              location: candidateProfile.city || 'N/A',
              education: candidateProfile.degree || candidateProfile.academicLevel || 'N/A',
              university: candidateProfile.university || 'N/A',
              fieldOfStudy: candidateProfile.major || candidateProfile.fieldOfStudy?.[0] || 'N/A',
              skills: candidateProfile.skills || [],
              bio: candidateProfile.bio || '',
              preferredWorkMode: candidateProfile.workMode,
              availability: candidateProfile.weeklyHours,
              resume: candidateProfile.cv,
              portfolio: candidateProfile.portfolio,
              languages: candidateProfile.languages || [],
            },
            matchPercentage,
            matchedSkills: [...(internship.mustHaveSkills || []), ...(internship.niceToHaveSkills || [])].filter(skill =>
              (candidateProfile.skills || []).some(cs => cs.toLowerCase() === skill.toLowerCase())
            ),
            createdAt: new Date()
          });
        }
      }

      // Sort by match percentage (highest first)
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      return NextResponse.json({ 
        matches,
        total: matches.length,
        role: {
          _id: internship._id,
          title: internship.title,
          department: internship.department || internship.area?.[0] || 'Other',
        }
      });
    }

    // Otherwise, get all internships with match counts
    const internships = await Internship.find({
      companyId: companyProfile._id,
      status: { $in: ['active', 'under_review'] }
    }).sort({ createdAt: -1 });

    if (internships.length === 0) {
      return NextResponse.json({ internships: [] });
    }

    // Get all candidate profiles once
    const candidateProfiles = await CandidateProfile.find()
      .populate('userId', 'firstName lastName email');

    const internshipsWithMatches = [];

    // Calculate match counts for each internship
    for (const internship of internships) {
      let matchCount = 0;
      
      for (const candidateProfile of candidateProfiles) {
        const matchPercentage = calculateMatchPercentage(internship, candidateProfile);
        if (matchPercentage >= 50) {
          matchCount++;
        }
      }

      internshipsWithMatches.push({
        _id: internship._id,
        title: internship.title,
        department: internship.department || internship.area?.[0] || 'Other',
        location: internship.location,
        postedOn: internship.createdAt,
        status: internship.status,
        matchesFound: matchCount,
        description: internship.description,
        mustHaveSkills: internship.mustHaveSkills,
        niceToHaveSkills: internship.niceToHaveSkills,
        duration: internship.duration,
        stipend: internship.stipend,
      });
    }

    return NextResponse.json({ 
      internships: internshipsWithMatches,
      total: internshipsWithMatches.length
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Trigger matching for a specific role (used after creating new role)
export async function POST(request) {
  try {
    await dbConnect();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { internshipId } = body;

    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID required' }, { status: 400 });
    }

    // Find the internship
    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }

    // Get all candidate profiles
    const candidateProfiles = await CandidateProfile.find()
      .populate('userId', 'name email');

    const matches = [];

    for (const candidateProfile of candidateProfiles) {
      const matchPercentage = calculateMatchPercentage(internship, candidateProfile);

      if (matchPercentage >= 50) {
        matches.push({
          roleId: internship._id,
          candidateId: candidateProfile._id,
          matchPercentage,
          matchedSkills: [...(internship.mustHaveSkills || []), ...(internship.niceToHaveSkills || [])].filter(skill =>
            (candidateProfile.skills || []).some(cs => cs.toLowerCase() === skill.toLowerCase())
          )
        });
      }
    }

    // TODO: Send email notifications to top matches
    // For now, just return the matches

    return NextResponse.json({ 
      message: 'Matching completed',
      matches: matches.length,
      topMatches: matches.slice(0, 5) // Return top 5 matches
    });

  } catch (error) {
    console.error('Error triggering matching:', error);
    return NextResponse.json(
      { error: 'Failed to trigger matching', details: error.message },
      { status: 500 }
    );
  }
}
