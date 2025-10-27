import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/utils/auth';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();

  const { id } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const { read = true } = payload;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      {
        read,
        readAt: read ? new Date() : null,
      },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

  const { id } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, userId: decoded.userId });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
