const form = document.getElementById("contactForm");
const button = document.getElementById("sendButton");
const statusBox = document.getElementById("status");

form.addEventListener("submit", async function(event) {

  event.preventDefault();

  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  statusBox.textContent = "";
  statusBox.className = "";

  // Validate phone number
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) {
    statusBox.textContent = "Please enter a valid phone number.";
    statusBox.className = "error";
    return;
  }

  // Validate message
  if (!message || message.length > 3000) {
    statusBox.textContent = "Please enter a valid message.";
    statusBox.className = "error";
    return;
  }

  button.disabled = true;
  button.textContent = "SENDING...";

  try {

    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Unable to send your message."
      );
    }

    statusBox.textContent = "Your message was sent successfully!";
    statusBox.className = "success";

    form.reset();

  } catch (error) {

    statusBox.textContent =
      error.message || "Something went wrong. Try again.";

    statusBox.className = "error";

  } finally {

    button.disabled = false;
    button.textContent = "SEND MESSAGE";

  }

});
