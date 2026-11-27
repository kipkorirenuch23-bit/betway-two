export default async function handler(req, res) {

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    const { phone, message } = req.body || {};

    // Validate incoming information
    if (
      typeof phone !== "string" ||
      typeof message !== "string" ||
      !/^[0-9+()\-\s]{7,20}$/.test(phone.trim()) ||
      !message.trim() ||
      message.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number or message."
      });
    }

    // Read private Vercel environment variables
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Telegram environment variables missing.");

      return res.status(500).json({
        success: false,
        error: "Telegram configuration is missing."
      });
    }

    // Prepare Telegram notification
    const telegramMessage =
      "NEW WEBSITE MESSAGE\n\n" +
      "Phone Number: " + phone.trim() +
      "\n\nMessage:\n" + message.trim();

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage
        }),
        signal: AbortSignal.timeout(15000)
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {

      console.error("Telegram API error:", result);

      return res.status(502).json({
        success: false,
        error: "Telegram failed to deliver your message."
      });
    }

    // Confirm successful Telegram delivery
    return res.status(200).json({
      success: true,
      message: "Message delivered successfully."
    });

  } catch (error) {

    console.error("Function error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error. Please try again."
    });

  }

}
