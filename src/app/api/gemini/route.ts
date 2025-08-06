import { NextRequest, NextResponse } from 'next/server'
import { calculateCost } from '@/lib/types/models'

export async function POST(request: NextRequest) {
  console.log('💎 Gemini API route called')
  
  try {
    const body = await request.json()
    console.log('📝 Gemini request body:', { 
      contentsLength: body.contents?.length,
      hasGenerationConfig: !!body.generationConfig
    })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('❌ Gemini API key not found in environment variables')
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Extract model from the URL path in Gemini API
    const model = body.model || 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    // Remove model from body as it's in the URL for Gemini
    const { model: _, ...requestBody } = body

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('🔄 Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Gemini API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Gemini API success:', {
      usageMetadata: data.usageMetadata,
      contentLength: data.candidates?.[0]?.content?.parts?.[0]?.text?.length
    })

    // Calculate cost if usage data is available
    if (data.usageMetadata && model) {
      const cost = calculateCost(model, data.usageMetadata.promptTokenCount, data.usageMetadata.candidatesTokenCount)
      if (cost > 0) {
        data.usageMetadata.cost = cost
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Gemini API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}