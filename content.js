chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrape") {
    try {
      getProfileData()
        .then((data) => sendResponse({ data }))
        .catch((error) => sendResponse({ error: error.message }));
    } catch (error) {
      sendResponse({ error: error.message });
    }
    return true; // Keep message channel open
  }
});

async function getProfileData() {
  const getValue = (selector, parent = document) => {
    const element = parent.querySelector(selector);
    return element?.textContent?.trim() || "Not Available";
  };

  const profile = {
    "Full Name": getValue("h1.gqctDmzNfgIenrhFcduvbnzYydLOdpwMxTo"),
    Headline: getValue(".text-body-medium.break-words"),
    Location: getValue(".text-body-small.inline.t-black--light.break-words"),
    "Profile URL": window.location.href,
  };

  // Click "Contact Info" link if available
  const contactInfoLink = document.querySelector(
    "#top-card-text-details-contact-info"
  );
  if (contactInfoLink) {
    contactInfoLink.click();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for overlay to load
  }

  // Extract contact info
  const contactSections = document.querySelectorAll(
    "section.pv-contact-info__contact-type"
  );
  contactSections.forEach((section) => {
    const header = getValue("h3.pv-contact-info__header", section);
    if (!header) return;

    switch (header) {
      case "Email":
        profile.Email = getValue("a[href^='mailto:']", section);
        break;
      case "Phone":
        profile.Phone = getValue("span.t-14.t-black.t-normal", section);
        break;
      case "Website":
        profile.Website = getValue("a.pv-contact-info__contact-link", section);
        break;
      case "Address":
        profile.Address = getValue(
          "a[href^='http://maps.apple.com/']",
          section
        );
        break;
    }
  });

  // Extract first and last name
  if (profile["Full Name"] !== "Not Available") {
    const nameParts = profile["Full Name"].split(" ");
    profile["First Name"] = nameParts[0];
    profile["Last Name"] = nameParts.slice(-1)[0];
  }

  return profile;
}
