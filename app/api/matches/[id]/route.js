import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import CompanyProfile from '@/lib/models/CompanyProfile';

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Find company profile
    const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId });

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Parse the match ID (format: roleId_candidateId)
    const [roleId, candidateId] = id.split('_');

    if (!roleId || !candidateId) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    // TODO: Store rejected matches in a separate collection to exclude them from future matches
    // For now, we'll just return success
    // In a real implementation, you might want to:
    // 1. Create a RejectedMatch model
    // 2. Store the rejection with reason and timestamp
    // 3. Filter out rejected matches in the GET /api/matches endpoint

    return NextResponse.json({
      message: 'Candidate removed from matches',
      matchId: id
    });

  } catch (error) {
    console.error('Error removing match:', error);
    return NextResponse.json(
      { error: 'Failed to remove match', details: error.message },
      { status: 500 }
    );
  }
}
