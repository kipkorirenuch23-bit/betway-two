export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { phone, message } = req.body || {};

    if (
      typeof phone !== "string" ||
      typeof message !== "string" ||
      !/^[0-9+()\-\s]{7,20}$/.test(phone.trim()) ||
      !message.trim() ||
      message.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number or message"
      });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return res.status(500).json({
        success: false,
        error: "Telegram settings are missing"
      });
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text:
            "NEW WEBSITE MESSAGE\n\n" +
            "Phone: " + phone.trim() +
            "\n\nMessage:\n" + message.trim()
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error("Telegram error:", result);

      return res.status(502).json({
        success: false,
        error: "Telegram could not deliver the message"
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}
