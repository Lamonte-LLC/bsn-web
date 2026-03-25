import { NextResponse } from 'next/server';

const getGraphqlEndpoint = () => {
  const endpoint = process.env.BSN_GRAPHQL_URI;

  if (!endpoint) {
    throw new Error('Missing BSN_GRAPHQL_URI environment variable');
  }

  return endpoint;
};

const buildForwardHeaders = (request: Request) => {
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const authorization = request.headers.get('authorization');

  if (contentType) headers.set('content-type', contentType);
  if (authorization) headers.set('authorization', authorization);

  return headers;
};

export async function POST(request: Request) {
  try {
    const endpoint = getGraphqlEndpoint();
    const body = await request.text();
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: buildForwardHeaders(request),
      body,
      cache: 'no-store',
    });

    const responseText = await upstreamResponse.text();

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'content-type':
          upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('GraphQL proxy POST error:', error);
    return NextResponse.json(
      { error: 'GraphQL proxy request failed' },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const endpoint = getGraphqlEndpoint();
    const url = new URL(request.url);
    const targetUrl = `${endpoint}?${url.searchParams.toString()}`;
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: buildForwardHeaders(request),
      cache: 'no-store',
    });

    const responseText = await upstreamResponse.text();

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'content-type':
          upstreamResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('GraphQL proxy GET error:', error);
    return NextResponse.json(
      { error: 'GraphQL proxy request failed' },
      { status: 502 },
    );
  }
}
