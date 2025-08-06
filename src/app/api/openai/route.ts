import { NextRequest, NextResponse } from 'next/server'
import { calculateCost } from '@/lib/types/models'

export async function POST(request: NextRequest) {
  console.log('🤖 OpenAI API route called')
  
  try {
    const body = await request.json()
    console.log('📝 OpenAI request body:', { 
      model: body.model, 
      messagesLength: body.messages?.length,
      hasData: !!body.data 
    })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    console.log('🔄 OpenAI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API error:', response.status, errorText)
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ OpenAI API success:', {
      usage: data.usage,
      contentLength: data.choices?.[0]?.message?.content?.length
    })

    // Calculate cost if usage data is available
    if (data.usage && body.model) {
      const cost = calculateCost(body.model, data.usage.prompt_tokens, data.usage.completion_tokens)
      if (cost > 0) {
        data.usage.cost = cost
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ OpenAI API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}