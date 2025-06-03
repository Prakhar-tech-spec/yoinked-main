import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 1x1 transparent GIF (base64)
const transparentGif = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const emailId = searchParams.get('emailId');
    const recipient = searchParams.get('recipient');
    const timestamp = new Date().toISOString();

    if (campaignId && emailId && recipient) {
      // Log open event to Supabase
      await supabase.from('email_opens').insert([
        { campaign_id: campaignId, email_id: emailId, recipient, opened_at: timestamp },
      ]);
    }

    return new Response(transparentGif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': transparentGif.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track open' }, { status: 500 });
  }
} 