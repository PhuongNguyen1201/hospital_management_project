import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    // Truyền req vào deleteSession để lấy cookie
    await deleteSession();
    return NextResponse.json({ message: 'Session deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting session' }, { status: 500 });
  }
}
