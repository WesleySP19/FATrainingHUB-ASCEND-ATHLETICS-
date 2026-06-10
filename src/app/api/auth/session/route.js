import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);


    if (payload.role === 'ROLE_COACH') {
      const coach = await prisma.coach.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, teamName: true }
      });
      if (!coach) return NextResponse.json({ loggedIn: false });
      return NextResponse.json({
        loggedIn: true,
        user: {
          id: coach.id,
          name: coach.name,
          email: coach.email,
          teamName: coach.teamName,
          role: 'COACH'
        }
      });
    } else if (payload.role === 'ROLE_ATHLETE') {
      const athlete = await prisma.athlete.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, position: true, overall: true }
      });
      if (!athlete) return NextResponse.json({ loggedIn: false });
      return NextResponse.json({
        loggedIn: true,
        user: {
          id: athlete.id,
          name: athlete.name,
          email: athlete.email,
          position: athlete.position,
          overall: athlete.overall,
          role: 'ATHLETE'
        }
      });
    }

    return NextResponse.json({ loggedIn: false });
  } catch (e) {
    return NextResponse.json({ loggedIn: false });
  }
}
