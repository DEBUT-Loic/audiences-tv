window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("dateForm");

    const formatDate = (date) => {
        const month = date.getMonth() + 1;
        return `${date.getFullYear()}-${month < 10 ? "0"+month : month}`;
    };

    const yesterday = new Date();
    
    input.max = formatDate(monthMax());

    let monthMin = new Date();
    monthMin.setDate(yesterday.getDate() - 1498);

    if(monthMin.getDate() > 1) {
        monthMin = new Date(monthMin.setMonth(monthMin.getMonth() + 1));
    }

    input.min = formatDate(monthMin);
})

window.addEventListener("DOMContentLoaded", async () => {    
    try {
        const d = new Date();
        await loadLinksStatsMonths(new Date(monthMax()).getMonth() + 1, d.getFullYear());
    } finally {
        $("#loading").animate(
            { top: "-100%" },
            1000,
            () => {
                $("#loading").hide(); // Optionnel mais recommandé
            }
        );
    }
});