import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Verifica expiração
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

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
