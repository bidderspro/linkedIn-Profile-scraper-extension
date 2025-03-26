document.addEventListener("DOMContentLoaded", () => {
  const scrapeBtn = document.getElementById("scrapeBtn");
  const loader = document.querySelector(".loader");
  const resultContainer = document.getElementById("resultContainer");
  const errorContainer = document.getElementById("errorContainer");

  scrapeBtn.addEventListener("click", async () => {
    try {
      // Show loading state
      scrapeBtn.disabled = true;
      loader.classList.remove("hidden");
      errorContainer.classList.add("hidden");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      // Send message and wait for response
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "scrape",
      });

      if (response?.data) {
        displayData(response.data);
        resultContainer.classList.remove("hidden");
      } else {
        showError(
          "No profile data found. Ensure you're on a LinkedIn profile page."
        );
      }
    } catch (error) {
      showError(`Error: ${error.message}`);
    } finally {
      // Reset UI state
      scrapeBtn.disabled = false;
      loader.classList.add("hidden");
    }
  });

  function displayData(data) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
    <div class="section">
      <h3>Basic Info</h3>
      <div class="data-item"><strong>Full Name:</strong> ${data["Full Name"]}</div>
      <div class="data-item"><strong>First Name:</strong> ${data["First Name"]}</div>
      <div class="data-item"><strong>Last Name:</strong> ${data["Last Name"]}</div>
      <div class="data-item"><strong>Headline:</strong> ${data.Headline}</div>
      <div class="data-item"><strong>Location:</strong> ${data.Location}</div>
    </div>

    <div class="section">
      <h3>Contact Info</h3>
      <div class="data-item"><strong>Email:</strong> ${data.Email}</div>
      <div class="data-item"><strong>Phone:</strong> ${data.Phone}</div>
      <div class="data-item"><strong>Website:</strong> ${data.Website}</div>
      <div class="data-item"><strong>Address:</strong> ${data.Address}</div>
      <div class="data-item"><strong>Profile URL:</strong> 
        <a href="${data["Profile URL"]}" target="_blank">${data["Profile URL"]}</a>
      </div>
    </div>
  `;
  }

  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
    resultContainer.classList.add("hidden");
  }
});
