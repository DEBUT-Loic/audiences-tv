window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("dateForm");

    const formatDate = (date) => {
        return `${date.getFullYear()}-W${getWeek(date)}`;
    };

    const yesterday = new Date();
    
    input.max = formatDate(weekMax());

    const weekMin = new Date();
    weekMin.setDate(yesterday.getDate() - 1498);
    input.min = formatDate(weekMin);
})

window.addEventListener("DOMContentLoaded", async () => {    
    try {
        const d = new Date();
        await loadLinksStatsWeeks(getWeek(weekMax()), d.getFullYear());
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