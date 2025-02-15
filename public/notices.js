document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("notices.json");  // Make sure notices.json is placed correctly in your project
        const notices = await response.json();

        const noticesContainer = document.getElementById("notices-container");

        if (notices.length === 0) {
            noticesContainer.innerHTML = "<p>No notices available.</p>";
            return;
        }

        notices.forEach(notice => {
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
        });

    } catch (error) {
        console.error("Error loading notices:", error);
        document.getElementById("notices-container").innerHTML = "<p>Failed to load notices.</p>";
    }
});
