/**
 * Test Gemini API v2.5 (updated August 2025)
 * (c) MikeRhodes.com.au
 *
 * Purpose: Quickly test your API KEY & Gemini account from a Google Ads script.
 *
 * If you need an API key, visit:
 *   https://aistudio.google.com/app/apikey
 *
 * To learn about optional parameters (e.g., temperature, top_p), see:
 *   https://ai.google.dev/api/generate-content
 */


// Enter your Gemini API Key here between the quotes
const API_KEY = '';  // ← If blank, script will prompt you to get one


// You can change this prompt if you want – the idea here is to ask a simple question to test the connection
const PROMPT = "What are Google Ads scripts?";


// Use a different model if you want
const MODEL = "gemini-2.5-flash";


// ----------------------------------------------------------------------------------

function main() {
  try {
    if (!API_KEY || API_KEY.trim().length === 0) {
      Logger.log(
        "❗ No Gemini API key provided. Please obtain one at: " +
        "https://aistudio.google.com/app/apikey"
      );
      return;
    }

    const startTime = new Date().getTime();
    const output = generateTextGemini(PROMPT, API_KEY, MODEL);
    Logger.log("Text output: " + output);

    const endTime = new Date().getTime();
    const durationSeconds = (endTime - startTime) / 1000;
    Logger.log("Time taken for script to run: " + durationSeconds + " seconds.");

  } catch (error) {
    Logger.log("An error occurred in main(): " + error);
  }
}

/**
 * Calls the Gemini generateContent endpoint.
 * Retries up to 3 times (initial + 2 retries) with a 2-second pause between each.
 *
 * @param {string} prompt   The user prompt to send.
 * @param {string} apiKey   Your Gemini API key.
 * @param {string} model    The model name (e.g., "gemini-2.5-flash").
 * @return {string}         The assistant's response or an error message.
 */
function generateTextGemini(prompt, apiKey, model) {
  Logger.log("Generating report with Gemini…");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payloadObject = {
    "contents": [
      {
        "parts": [
          { "text": prompt }
        ]
      }
    ],
    "generationConfig": {
      "maxOutputTokens": 8000,
      "temperature": 0.1
      // Optional parameters available 
    }
  };

  const httpOptions = {
    "method": "post",
    "contentType": "application/json",
    "muteHttpExceptions": true,
    "payload": JSON.stringify(payloadObject)
  };

  let response;
  let responseCode;
  let responseText;

  // Attempt up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    response = UrlFetchApp.fetch(url, httpOptions);
    responseCode = response.getResponseCode();
    responseText = response.getContentText();

    if (responseCode === 200) {
      break;
    }

    Logger.log(
      "Attempt " + attempt + " failed with status " + responseCode +
      ". Retrying in 2 seconds…"
    );
    Utilities.sleep(2000);
  }

  if (responseCode !== 200) {
    Logger.log(
      "Error: Gemini API request failed after 3 attempts. Status: " +
      responseCode
    );
    Logger.log(
      "See https://ai.google.dev/api/generate-content for more info."
    );
    try {
      const errorJson = JSON.parse(responseText);
      Logger.log("Error details: " + JSON.stringify(errorJson.error));
      return "Error: " + (errorJson.error.message || "Unknown error from Gemini.");
    } catch (parseError) {
      Logger.log("Error parsing Gemini API error response.");
      return "Error: Failed to parse Gemini error response.";
    }
  }

  // Parse the successful response
  try {
    const parsed = JSON.parse(responseText);
    // Logger.log("Full response: " + responseText);
    
    if (!parsed || !Array.isArray(parsed.candidates) || parsed.candidates.length === 0) {
      return "Error: No candidates in response.";
    }
    
    const candidate = parsed.candidates[0];
    
    // Check for finish reason issues
    if (candidate.finishReason === "MAX_TOKENS") {
      return "Error: Response was cut off due to token limit. Try reducing maxOutputTokens or shortening your prompt.";
    }
    
    if (candidate.finishReason === "SAFETY") {
      return "Error: Response blocked for safety reasons.";
    }
    
    // Check for content and parts
    if (
      candidate.content &&
      Array.isArray(candidate.content.parts) &&
      candidate.content.parts.length > 0 &&
      candidate.content.parts[0].text
    ) {
      return candidate.content.parts[0].text;
    } else {
      Logger.log("Unexpected response structure: " + responseText);
      return "Error: No text content in response. Check your prompt and API key.";
    }
  } catch (jsonError) {
    Logger.log("Error parsing Gemini API success response: " + jsonError);
    return "Error: Failed to parse Gemini response.";
  }
}



// Thanks for trying out the script.

// PS you're awesome!