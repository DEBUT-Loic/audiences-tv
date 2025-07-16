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

async function loadLinks() {
    const res  = await fetch('api/get_audiences.php');
    const data = await res.json();
    
    let rang=1;
    let total = data.length-1;
    console.log(data);
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
            else {
                let partie =
                rang-4 <= Math.floor( (total-4) / 2 ) ? "part1" : "part2";

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
            $(".dateURL").text(data[index]["date"]);
            let dateMots = data[index]["date"].split(" ");
            $("body").addClass(dateMots[0].toLowerCase());
            $("title").text(`${$("title").text()} - ${data[index]["date"]}`)
        }
    });
    
    // Exécuter la fonction si la largeur est <= 768px
    console.log($(window).width() <= 768)
    if ($(window).width() <= 768) {
        createImgProgrammeContainer();
    }
}

// window.addEventListener('DOMContentLoaded',loadLinks);

window.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadLinks();
    } catch (error) {
        console.error("Erreur lors du chargement des liens :", error);
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