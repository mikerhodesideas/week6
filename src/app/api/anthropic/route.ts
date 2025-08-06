import { NextRequest, NextResponse } from 'next/server'
import { calculateCost } from '@/lib/types/models'

export async function POST(request: NextRequest) {
  console.log('🧠 Anthropic API route called')
  
  try {
    const body = await request.json()
    console.log('📝 Anthropic request body:', { 
      model: body.model, 
      messagesLength: body.messages?.length,
      hasSystem: !!body.system
    })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('❌ Anthropic API key not found in environment variables')
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    console.log('🔄 Anthropic API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Anthropic API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Anthropic API success:', {
      usage: data.usage,
      contentLength: data.content?.[0]?.text?.length
    })

    // Calculate cost if usage data is available
    if (data.usage && body.model) {
      const cost = calculateCost(body.model, data.usage.input_tokens, data.usage.output_tokens)
      if (cost > 0) {
        data.usage.cost = cost
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Anthropic API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}