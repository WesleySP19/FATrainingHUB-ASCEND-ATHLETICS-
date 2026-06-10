import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Rotas do Coach (/coach/*)
  if (pathname.startsWith('/coach')) {
    // Permitir acesso à página de login (/coach) e registro (/coach/register)
    if (pathname === '/coach' || pathname === '/coach/register') {
      if (token) {
        try {
          const payload = decodeJwt(token);
          if (payload.role === 'ROLE_COACH') {
            return NextResponse.redirect(new URL('/coach/roster', request.url));
          }
        } catch (e) {
          // Token inválido ou expirado, limpamos
          const response = NextResponse.next();
          response.cookies.delete('token');
          return response;
        }
      }
      return NextResponse.next();
    }

    // Proteger outras sub-rotas (/coach/roster, etc)
    if (!token) {
      return NextResponse.redirect(new URL('/coach', request.url));
    }

    try {
      const payload = decodeJwt(token);
      if (payload.role !== 'ROLE_COACH') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      const response = NextResponse.redirect(new URL('/coach', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 2. Rotas do Atleta (/athlete/*), Treinamento (/training) e Vestiário (/locker)
  if (pathname.startsWith('/athlete') || pathname.startsWith('/training') || pathname.startsWith('/locker')) {
    // Permitir página de login do atleta
    if (pathname === '/athlete/login') {
      if (token) {
        try {
          const payload = decodeJwt(token);
          if (payload.role === 'ROLE_ATHLETE') {
            return NextResponse.redirect(new URL(`/athlete/${payload.userId}`, request.url));
          }
        } catch (e) {
          const response = NextResponse.next();
          response.cookies.delete('token');
          return response;
        }
      }
      return NextResponse.next();
    }

    // Outros acessos exigem token
    if (!token) {
      return NextResponse.redirect(new URL('/athlete/login', request.url));
    }

    try {
      const payload = decodeJwt(token);
      
      // Controle de Relação: Atleta só vê os seus próprios dados, Coach pode ver tudo
      if (payload.role === 'ROLE_ATHLETE') {
        if (pathname.startsWith('/athlete/') && pathname !== `/athlete/${payload.userId}`) {
          return NextResponse.redirect(new URL(`/athlete/${payload.userId}`, request.url));
        }
      } else if (payload.role !== 'ROLE_COACH') {
        return NextResponse.redirect(new URL('/athlete/login', request.url));
      }
    } catch (e) {
      const response = NextResponse.redirect(new URL('/athlete/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Helper simples para decodificar o payload do JWT no Edge Runtime
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verifica expiração
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }
    return payload;
  } catch (e) {
    throw new Error('Invalid token decodification');
  }
}

export const config = {
  matcher: ['/coach/:path*', '/athlete/:path*', '/training/:path*', '/locker/:path*'],
};
