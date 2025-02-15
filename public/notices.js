document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch notices from the Vercel API endpoint
        const response = await fetch("/api/notices");  // Fetches data from the Vercel API endpoint
        const notice = await response.json();

        const noticesContainer = document.getElementById("notices-container");

        // If no notices found, display a message
        if (!notice || Object.keys(notice).length === 0) {
            noticesContainer.innerHTML = "<p>No notices available.</p>";
            return;
        }

        const noticeElement = document.createElement("div");
        noticeElement.classList.add("notice");

        noticeElement.innerHTML = `
            <img src="${notice.image}" alt="Notice Image" class="notice-image">
            <div class="notice-content">
                <h3 class="notice-title">${notice.title}</h3>
                <p class="notice-description">${notice.description}</p>
                <p class="notice-date"><strong>Date:</strong> ${notice.date}</p>
                <a href="${notice.link}" target="_blank" class="notice-link">Read More</a>
            </div>
        `;

        noticesContainer.appendChild(noticeElement);

    } catch (error) {
        console.error("Error loading notices:", error);
        document.getElementById("notices-container").innerHTML = "<p>Failed to load notices.</p>";
    }
});
