window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("dateForm");
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Mois : 0–11
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    input.max = formatDate(yesterday);

    const maxDate = new Date();
    maxDate.setDate(yesterday.getDate() - 1498);
    input.min = formatDate(maxDate);
})

window.addEventListener("DOMContentLoaded", async () => {    
    try {
        await loadLinks();
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