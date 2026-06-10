import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-secret-key-12345';

// Helper Edge-compatible para verificar e decodificar a assinatura criptográfica do JWT (HS256)
async function verifyJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    // Decodifica Header e Payload
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (header.alg !== 'HS256') return false;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verifica expiração
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;

    // Prepara chaves criptográficas
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const message = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Decodifica a assinatura do Base64Url
    const sigString = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBuf = new Uint8Array(sigString.length);
    for (let i = 0; i < sigString.length; i++) {
      sigBuf[i] = sigString.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBuf, message);
    return isValid ? payload : false;
  } catch (e) {
    return false;
  }
}

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Whitelists de Rotas Públicas (Nível de Acesso Anônimo)
  const isPublicFrontend = 
    pathname === '/coach' || 
    pathname === '/coach/register' || 
    pathname === '/athlete/login';

  const isPublicAuthApi = 
    pathname === '/api/coach/login' || 
    pathname === '/api/coach/register' || 
    pathname === '/api/athlete/login' || 
    pathname === '/api/athlete/register' || 
    pathname === '/api/auth/session' || 
    pathname === '/api/auth/logout' ||
    pathname === '/api/rank'; // Rank leaderboard público

  // Acesso de Atleta via PIN do treino (Ex: /api/workouts/XYZ123/finish)
  const isPublicWorkoutApi = 
    pathname.startsWith('/api/workouts/') && pathname.split('/').length > 3;

  // GET de visualização das logos dos times no carrossel da home page
  const isPublicTeamGet = 
    pathname === '/api/coach/team' && method === 'GET';

  const isPublicRoute = isPublicFrontend || isPublicAuthApi || isPublicWorkoutApi || isPublicTeamGet;

  // 2. Se for rota pública, processa redirecionamento inteligente (prevenção de relogin se logado)
  if (isPublicRoute) {
    if (token) {
      const payload = await verifyJwt(token, JWT_SECRET);
      if (payload) {
        if (pathname === '/coach' || pathname === '/coach/register') {
          if (payload.role === 'ROLE_COACH') {
            return NextResponse.redirect(new URL('/coach/roster', request.url));
          }
        }
        if (pathname === '/athlete/login') {
          if (payload.role === 'ROLE_ATHLETE') {
            return NextResponse.redirect(new URL(`/athlete/${payload.userId}`, request.url));
          }
        }
      } else {
        // Se o token estiver expirado na rota pública, removemos o cookie
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // 3. Se for rota privada, exige autenticação
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Acesso negado. Token ausente.' }, { status: 401 });
    }
    if (pathname.startsWith('/coach')) {
      return NextResponse.redirect(new URL('/coach', request.url));
    }
    return NextResponse.redirect(new URL('/athlete/login', request.url));
  }

  // 4. Valida a assinatura do token
  const payload = await verifyJwt(token, JWT_SECRET);
  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Assinatura do token inválida ou expirada.' }, { status: 401 });
    }
    const response = pathname.startsWith('/coach') 
      ? NextResponse.redirect(new URL('/coach', request.url)) 
      : NextResponse.redirect(new URL('/athlete/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // 5. Níveis de Autorização (Roles)
  
  // A. Regra do Coach: Apenas Coaches podem fazer mutações de workouts, gerenciar times ou acessar Roster
  if (pathname.startsWith('/coach') || pathname.startsWith('/api/coach') || pathname === '/api/workouts') {
    if (payload.role !== 'ROLE_COACH') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Forbidden: Apenas coaches possuem autorização para esta ação.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // B. Regra do Atleta: Atletas só podem ler e escrever nos seus próprios registros
  if (pathname.startsWith('/athlete') || pathname.startsWith('/training') || pathname.startsWith('/locker') || pathname.startsWith('/api/athlete')) {
    if (payload.role === 'ROLE_ATHLETE') {
      if (pathname.startsWith('/athlete/')) {
        const parts = pathname.split('/');
        const pathAthleteId = parts[2];
        if (pathAthleteId && pathAthleteId !== payload.userId) {
          return NextResponse.redirect(new URL(`/athlete/${payload.userId}`, request.url));
        }
      }
      if (pathname.startsWith('/api/athlete/')) {
        const parts = pathname.split('/');
        const pathAthleteId = parts[3];
        if (pathAthleteId && pathAthleteId !== payload.userId) {
          return NextResponse.json({ success: false, error: 'Forbidden: Acesso restrito apenas ao próprio atleta.' }, { status: 403 });
        }
      }
    } else if (payload.role !== 'ROLE_COACH') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Forbidden: Autorização inválida.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/athlete/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/coach/:path*', 
    '/athlete/:path*', 
    '/training/:path*', 
    '/locker/:path*', 
    '/api/:path*'
  ],
};

