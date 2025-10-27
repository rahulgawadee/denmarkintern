import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/lib/models/Notification';
import CandidateProfile from '@/lib/models/CandidateProfile';
import CompanyProfile from '@/lib/models/CompanyProfile';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
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

    const filter = {
      userId: decoded.userId,
    };

    if (decoded.role) {
      filter.role = decoded.role;
    }

    const now = new Date();
    const notifications = await Notification.find({
      ...filter,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const unreadCount = notifications.reduce((count, notification) =>
      notification.read ? count : count + 1,
    0);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const { title, message, category = 'general', link = '', metadata = {} } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    let companyId = undefined;
    let candidateId = undefined;

    if (decoded.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId: decoded.userId }, '_id');
      companyId = companyProfile?._id;
    }

    if (decoded.role === 'candidate') {
      const candidateProfile = await CandidateProfile.findOne({ userId: decoded.userId }, '_id');
      candidateId = candidateProfile?._id;
    }

    const notification = await Notification.create({
      userId: decoded.userId,
      role: decoded.role,
      companyId,
      candidateId,
      title,
      message,
      category,
      link,
      metadata,
    });

    return NextResponse.json({
      success: true,
      notification,
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
