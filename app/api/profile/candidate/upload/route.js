import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    console.log('📤 POST /api/profile/candidate/upload - File upload');
    
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'candidate') {
      console.log('❌ Unauthorized - Not a candidate');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('type'); // 'cv' or 'photo'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('📄 File:', file.name, 'Type:', fileType, 'Size:', file.size);
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = {
      cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    };
    
    if (fileType && allowedTypes[fileType] && !allowedTypes[fileType].includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type for ${fileType}. Allowed: ${allowedTypes[fileType].join(', ')}` 
      }, { status: 400 });
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'candidates', decoded.userId);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log('Directory already exists or error creating it:', error.message);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${fileType || 'file'}_${timestamp}${extension}`;
    const filepath = path.join(uploadDir, filename);
    
    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/candidates/${decoded.userId}/${filename}`;
    
    console.log('✅ File uploaded:', publicUrl);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'File uploaded successfully',
        url: publicUrl,
        filename: file.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
