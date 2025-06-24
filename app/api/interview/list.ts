import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const snapshot = await db
    .collection('interviews')
    .where('userId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .get();
  const interviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ interviews });
} 