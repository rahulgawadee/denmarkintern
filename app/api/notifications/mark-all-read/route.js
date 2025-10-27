import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await Notification.updateMany(
      { userId: decoded.userId, read: false },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
