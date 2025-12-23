$(document).ready(() => {
    const JOURS = ["Flavidi", "Célazidi", "Viridi", "Rosadi", "Rubidi", "Azuridi", "Nigalbadi"];
    const MOIS = ["Primène","Duomène","Trimène","Quartimène","Quintimène","Sextimène","Septimène","Octamène","Nonamène","Décimène","Finamène","Vacambre","Interpause"];
    let joursDOM = "";
    let tableDOM = ""

    JOURS.forEach((elem) => {
        joursDOM += `<th>${elem}</th>`;
    })

    MOIS.forEach((elem, index) => {
        tableDOM += `<table id="${elem.toLowerCase()}">
            <thead><tr><th colspan="7">${elem}</th></tr></thead>
            <tbody><tr>${joursDOM}</tr>`;

        let numJoursDOM = "<tr>";
        for(let i=1; i<=28; i++) {
            numJoursDOM += `<td>${i}</td>`;

            if(i % 7 == 0) {
                numJoursDOM += "</tr><tr>";
            }
        }
        numJoursDOM += "</tr>";

        tableDOM += `${numJoursDOM} </tbody> </table>`;
    })

    $("main").append(tableDOM);

    $("tbody th").each((index, elem) => {
        $(elem).css({width: $("tbody th").eq($("tbody th").length-1).width()+"px"});
    })
})

// Lun, Mar, Mer => même semaine que le 1er sept
// Jeu, Ven, Sam, Dim => semaine prochaine par rapport au 1er sept 