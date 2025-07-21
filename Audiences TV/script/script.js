function numStr(a, b) {
        a = '' + a;
        b = b || ' ';
        var c = '',
        d = 0;
    while (a.match(/^0[0-9]/)) {
        a = a.substr(1);
    }
    for (var i = a.length-1; i >= 0; i--) {
        c = (d != 0 && d % 3 == 0) ? a[i] + b + c : a[i] + c;
        d++;
    }
    return c;
}

function deleteAccent(a) {
    return a.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function srcImg(string) {
    return deleteAccent(string.replaceAll(" ","-").toLowerCase());
}

function decodeHTMLEntities(str) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, "text/html");
    return doc.documentElement.textContent;
}

function createImgProgrammeContainer() {
    const card = $(".card");
    for(let i=0;i<card.length;i++) {
        const imgContainer = $('<div class="img-programme-mobile"></div>');
        
        imgContainer.append(card.eq(i).find("img"));
        imgContainer.append(card.eq(i).find(".programme"));
        imgContainer.append(card.eq(i).find(".programme_classement"));

        if(i < 3) {
            card.eq(i).find(".info").prepend(imgContainer);
        }
        else {
            card.eq(i).prepend(imgContainer);
            card.eq(i).prepend(card.eq(i).find(".rang"));
        }
    }
}

async function loadLinks() {
    let getForm = "";

    // Récupérer les paramètres de l'URL actuelle
    const params = new URLSearchParams(window.location.search);

    if(params.get("dateForm") !== undefined) {
        getForm = "?"+params.toString();
    }

    const res  = await fetch(`api/get_audiences.php${getForm}`);
    const data = await res.json();
    
    let rang=1;
    let total = data.length-1;
    let rangOdd = 0;
    data.forEach((elem,index) => {

        if(index != data.length-1) {
            const idDiv =
            rang === 1 ? "premier" :
            rang === 2 ? "deuxieme" :
            rang === 3 ? "troisieme" :
            rang < total - 2 ? "milieu" : "fin";

            if(rang < 4) {
                // podium
                $(`#${idDiv} img`).attr("src",`img/${srcImg(elem.chaine)}.png`).attr("alt",elem.chaine);
                $(`#${idDiv} .programme`).text(decodeHTMLEntities(elem.programme));
                $(`#${idDiv} .audience`).text(numStr(elem.audience));
                $(`#${idDiv} .pda`).text(elem.pda);
            }
            else if(rang === 4) {
                $(`#classement`).prepend(`
                    <div class="card">
                        <div class="rang">
                            <p>${rang}</p>
                        </div>
                        
                        <img src="img/${srcImg(elem.chaine)}.png" alt="${elem.chaine}">
                        <p class="programme_classement">${decodeHTMLEntities(elem.programme)}</p>

                        <div class="audiencePDA">
                            <div class="audienceDiv">
                                <p class="audience">${numStr(elem.audience)}</p>
                                <p>TÉLÉSPECTATEURS</p>
                            </div>

                            <div class="pdaDiv">
                                <p class="pda">${elem.pda}</p>
                                <p>PDA</p>
                            </div>
                        </div>
                    </div>
                    `)
            }
            else if(total % 2 == 1 && rang == 5) {
                $(`#classement #part1`).before(`
                    <div class="milieu card">
                        <div class="rang">
                            <p>${rang}</p>
                        </div>
                        
                        <img src="img/${srcImg(elem.chaine)}.png" alt="${elem.chaine}">
                        <p class="programme_classement">${decodeHTMLEntities(elem.programme)}</p>

                        <div class="audiencePDA">
                            <div class="audienceDiv">
                                <p class="audience">${numStr(elem.audience)}</p>
                                <p>TÉLÉSPECTATEURS</p>
                            </div>

                            <div class="pdaDiv">
                                <p class="pda">${elem.pda}</p>
                                <p>PDA</p>
                            </div>
                        </div>
                    </div>
                    `);
                    rangOdd = 1;
            }
            else {
                let partie =
                rang-4-rangOdd <= Math.floor( (total-4-rangOdd) / 2 ) ? "part1" : "part2";

                $(`#classement #${partie}`).append(`
                    <div class="${rang == total-3 ? "last-milieu" : idDiv} card">
                        <div class="rang">
                            <p>${rang}</p>
                        </div>
                        
                        <img src="img/${srcImg(elem.chaine)}.png" alt="${elem.chaine}">
                        <p class="programme_classement">${decodeHTMLEntities(elem.programme)}</p>

                        <div class="audiencePDA">
                            <div class="audienceDiv">
                                <p class="audience">${numStr(elem.audience)}</p>
                                <p>TÉLÉSPECTATEURS</p>
                            </div>

                            <div class="pdaDiv">
                                <p class="pda">${elem.pda}</p>
                                <p>PDA</p>
                            </div>
                        </div>
                    </div>
                    `)
            };

            rang++;
        }
        else {
            let dateRep = data[index]["date"][0].replace("1", "1er");

            $(".dateURL").text(dateRep);
            let dateMots = dateRep.split(" ");
            $("body").addClass(dateMots[0].toLowerCase());
            $("title").text(`${$("title").text()} - ${dateRep}`)

            if(data[index]["date"].length > 1) {
                $("#dateForm").val(data[index]["date"][1]);
            }
        }
    });

    if ($(window).width() <= 768) {
        createImgProgrammeContainer();
    }

    document.querySelector(".btnCancel").addEventListener('click', () => {
        // Supprime les paramètres GET sans recharger la page
        const urlSansParam = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, urlSansParam);
        location.reload();
    });
}

// window.addEventListener('DOMContentLoaded',loadLinks);

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

    // Borne maximale = dans 30 jours
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