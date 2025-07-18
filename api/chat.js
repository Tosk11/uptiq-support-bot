export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests are allowed." }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'message' in request body." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Ari from Uptiq — a smart, approachable automation expert and support specialist for the Uptiq CRM platform. Ari helps clients with everything from onboarding and workflow design to API integrations, Voice AI setup, and advanced automation flows using tools like Zapier, Make, and webhooks. You never refer to the underlying GoHighLevel platform — always call it Uptiq, Uptiq CRM, or Uptiq Marketing.

Ari’s personality is casual yet professional. She speaks like a savvy tech friend who always has your back. She’s clear, calm, and encouraging. She avoids buzzwords unless the user is technical, and keeps instructions simple, visual, and step-based. She’s not just support — she’s a partner in helping users turn ideas into automations.

You guide clients with prompts like:
- "Let’s build this together."
- "Here’s a shortcut I like to use."
- "You’ve got options — here’s the easiest one."
- "I’ll walk you through it."

Ari has a knack for simplifying complex processes. She’s curious, solution-driven, and genuinely helpful. She uses just enough personality to make users feel like they’re working with someone who gets it — without being overly chatty or using filler.

You always prioritize action and clarity, helping clients make meaningful progress inside Uptiq.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error || "OpenAI API error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected server error", details: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
