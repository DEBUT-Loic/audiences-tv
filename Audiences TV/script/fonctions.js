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

function getWeek(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function weekMax() {
    const d = new Date();

    d.setDate(d.getDate() - 1);
    if(d.getDay() > 0) {
        d.setDate(d.getDate() - 6);
    }

    return d;
}

function monthMax() {
    const d = new Date();
    return new Date(d.setMonth(d.getMonth() - 1));
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
            let isPremier = parseInt($("#dateForm").attr("max").substr( $("#dateForm").attr("max").length-2 )) == 1;
            
            if(data[index]["date"].length > 1) {
                $("#dateForm").val(data[index]["date"][1]);
                
                isPremier = parseInt( data[index]["date"][1].substr( data[index]["date"][1].length-2 ) ) == 1;
            }
            
            let dateRep = isPremier ? data[index]["date"][0].replace("1", "1er") : data[index]["date"][0];

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

    $("#btnStats").css("width",$(".dateURL").innerWidth()+"px");

    document.querySelector(".btnCancel").addEventListener('click', () => {
        // Supprime les paramètres GET sans recharger la page
        const urlSansParam = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, urlSansParam);
        location.reload();
    });
}

async function loadLinksStatsWeeks(week, year) {
    let chainesTab = [], gradientBody = ["#f2ff0d","#3af8ff","#56ff50","#ff5def","#ff5757","#2f45ff","#d5d5d5"];

    // Récupérer les paramètres de l'URL actuelle
    const params = new URLSearchParams(window.location.search);

    if(params.get("dateForm") !== null) {
        week = params.get("dateForm").slice(-2);
        year = params.get("dateForm").substring(0, 4);
    }

    if(week>9 && year>=2025) {
        chainesTab = chainesApresARCOM;
    }
    else {
        chainesTab = chainesAvantARCOM;
    }
    
    const res  = await fetch(`../../api/get_averages_audiences_weeks.php?week=${week}&year=${year}`);
    const data = await res.json();

    let classement = data.classement;
    let total = classement.length;
    let topPx = $(window).width() <= 768 ? 135 : 80;


    $(".dateURL").text(data.semaine);
    $("#btnStats").css("width",$(".dateURL").innerWidth()+"px");

    let chainesFinales = [];
    
    chainesTab.forEach(function(elem) {
        let found = false;
        
        for (let i = 0; i < total; i++) {
            if (elem === classement[i].chaine) {
                found = true;

                let pourcentWidth = Math.round((classement[i].moyenne_audience / classement[0].moyenne_audience) * 10_000) / 100;

                $("#classement").append(`
                    <div class="card">
                        <div class="rang"><p></p></div>
                        <div class="imgDiv">
                            <img src="../../img/${srcImg(classement[i].chaine)}.png" alt="${classement[i].chaine}"/>
                        </div>
                        <div class="progressMoyenne" data-width="${pourcentWidth}">
                            <div class="progressBar ${srcImg(classement[i].chaine.replace(/6(?=\w)/g, "six").replace(/\+/g, "plus"))}"></div>
                            <div class="moyenne" id="moyenne${i}">
                                <p>0</p>
                                <p>TÉLÉSPECTATEURS</p>
                            </div>
                        </div>
                    </div>
                `);

                setTimeout(function() {
                    $({ countNum: 0 }).animate({ countNum: classement[i].moyenne_audience }, {
                        duration: 3000,
                        easing: "swing",
                        step: function () {
                            $(`#moyenne${i} > p:first-child`).text(numStr(Math.floor(this.countNum)));
                        },
                        complete: function () {
                            $(`#moyenne${i} > p:first-child`).text(numStr(this.countNum)); // Arrondi final
                        }
                    });
                }, 1000);
            }
        }

        if (found) {
            chainesFinales.push(elem); // on garde que les chaînes valides
        }
    });

    setTimeout(() => {
        $(".progressMoyenne").each(function() {
            const $bar = $(this).find(".progressBar");
            const value = $(this).data("width");
            $bar.addClass("shiny").animate({ width: value + "%" }, 3000, function() {
                $bar.removeClass("shiny");
            });
        });
    }, 1000);

    $("#classement .card").each(function (i) {
        $(this).css("top", i * topPx + "px");
    });

    $("#classement").css("height",($("#classement .card").length * topPx) + "px");
    
    setTimeout(function() {
        $("#classement .card").each(function(j) {
            let nomChaine = chainesFinales[j];
            let indexClassement = classement.findIndex(e => e.chaine == nomChaine);

            if (indexClassement !== -1) {
                // Animation de déplacement
                $(this).animate({ top: indexClassement * topPx + "px" }, 1000);

                // Mise à jour du rang visible
                $(this).find(".rang p").text(indexClassement + 1);

                // Application des classes podium
                if (indexClassement === 0) $(this).addClass('premier active-gradient');
                else if (indexClassement === 1) $(this).addClass('deuxieme active-gradient');
                else if (indexClassement === 2) $(this).addClass('troisieme active-gradient');
                else if (indexClassement === 3) $(this).addClass('quatrieme active-gradient');
                else if (indexClassement === classement.length - 4) $(this).addClass('last-milieu active-gradient');
                else if (indexClassement === classement.length - 3) $(this).addClass('antepenultieme active-gradient');
                else if (indexClassement === classement.length - 2) $(this).addClass('penultieme active-gradient');
                else if (indexClassement === classement.length - 1) $(this).addClass('ultieme active-gradient');
                else $(this).addClass('milieu active-gradient');
            }
        });
    }, 4000);

    $("title").text(`${$("title").text()} - ${data.semaine}`);

    $("body").css("background-image",`linear-gradient(135deg, ${gradientBody[month % 7]} 10%, #000)`);

    document.querySelector(".btnCancel").addEventListener('click', () => {
        // Supprime les paramètres GET sans recharger la page
        const urlSansParam = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, urlSansParam);
        location.reload();
    });

    let cible = 100;      // Valeur finale
    let duree = 2000;     // Durée en ms (ici 2 secondes)

    $({ countNum: 0 }).animate({ countNum: cible }, {
        duration: duree,
        easing: 'swing',
        step: function () {
            $('#compteur').text(Math.floor(this.countNum));
        },
        complete: function () {
            $('#compteur').text(this.countNum); // Arrondi final
        }
    });
}

async function loadLinksStatsMonths(month, year) {
    let chainesTab = [], gradientBody = ["#f2ff0d","#3af8ff","#56ff50","#ff5def","#ff5757","#2f45ff","#d5d5d5"];

    // Récupérer les paramètres de l'URL actuelle
    const params = new URLSearchParams(window.location.search);

    if(params.get("dateForm") !== null) {
        month = params.get("dateForm").slice(-2);
        year = params.get("dateForm").substring(0, 4);
    }

    if(month>=2 && year>=2025) {
        chainesTab = chainesApresARCOM;
    }
    else {
        chainesTab = chainesAvantARCOM;
    }
    
    const res  = await fetch(`../../api/get_averages_audiences_months.php?month=${month}&year=${year}`);
    const data = await res.json();

    let classement = data.classement;
    let total = classement.length;
    let topPx = $(window).width() <= 768 ? 135 : 80;


    $(".dateURL").text(data.mois);
    $("#btnStats").css("width",$(".dateURL").innerWidth()+"px");

    let chainesFinales = [];
    
    chainesTab.forEach(function(elem) {
        let found = false;
        
        for (let i = 0; i < total; i++) {
            if (elem === classement[i].chaine) {
                found = true;

                let pourcentWidth = Math.round((classement[i].moyenne_audience / classement[0].moyenne_audience) * 10_000) / 100;

                $("#classement").append(`
                    <div class="card">
                        <div class="rang"><p></p></div>
                        <div class="imgDiv">
                            <img src="../../img/${srcImg(classement[i].chaine)}.png" alt="${classement[i].chaine}"/>
                        </div>
                        <div class="progressMoyenne" data-width="${pourcentWidth}">
                            <div class="progressBar ${srcImg(classement[i].chaine.replace(/6(?=\w)/g, "six").replace(/\+/g, "plus"))}"></div>
                            <div class="moyenne" id="moyenne${i}">
                                <p>0</p>
                                <p>TÉLÉSPECTATEURS</p>
                            </div>
                        </div>
                    </div>
                `);

                setTimeout(function() {
                    $({ countNum: 0 }).animate({ countNum: classement[i].moyenne_audience }, {
                        duration: 3000,
                        easing: "swing",
                        step: function () {
                            $(`#moyenne${i} > p:first-child`).text(numStr(Math.floor(this.countNum)));
                        },
                        complete: function () {
                            $(`#moyenne${i} > p:first-child`).text(numStr(this.countNum)); // Arrondi final
                        }
                    });
                }, 1000);
            }
        }

        if (found) {
            chainesFinales.push(elem); // on garde que les chaînes valides
        }
    });

    setTimeout(() => {
        $(".progressMoyenne").each(function() {
            const $bar = $(this).find(".progressBar");
            const value = $(this).data("width");
            $bar.addClass("shiny").animate({ width: value + "%" }, 3000, function() {
                $bar.removeClass("shiny");
            });
        });
    }, 1000);

    $("#classement .card").each(function (i) {
        $(this).css("top", i * topPx + "px");
    });

    $("#classement").css("height",($("#classement .card").length * topPx) + "px");
    
    setTimeout(function() {
        $("#classement .card").each(function(j) {
            let nomChaine = chainesFinales[j];
            let indexClassement = classement.findIndex(e => e.chaine == nomChaine);

            if (indexClassement !== -1) {
                // Animation de déplacement
                $(this).animate({ top: indexClassement * topPx + "px" }, 1000);

                // Mise à jour du rang visible
                $(this).find(".rang p").text(indexClassement + 1);

                // Application des classes podium
                if (indexClassement === 0) $(this).addClass('premier active-gradient');
                else if (indexClassement === 1) $(this).addClass('deuxieme active-gradient');
                else if (indexClassement === 2) $(this).addClass('troisieme active-gradient');
                else if (indexClassement === 3) $(this).addClass('quatrieme active-gradient');
                else if (indexClassement === classement.length - 4) $(this).addClass('last-milieu active-gradient');
                else if (indexClassement === classement.length - 3) $(this).addClass('antepenultieme active-gradient');
                else if (indexClassement === classement.length - 2) $(this).addClass('penultieme active-gradient');
                else if (indexClassement === classement.length - 1) $(this).addClass('ultieme active-gradient');
                else $(this).addClass('milieu active-gradient');
            }
        });
    }, 4000);

    $("title").text(`${$("title").text()} - ${data.mois}`);

    $("body").css("background-image",`linear-gradient(135deg, ${gradientBody[month % 7]} 10%, #000)`);

    document.querySelector(".btnCancel").addEventListener('click', () => {
        // Supprime les paramètres GET sans recharger la page
        const urlSansParam = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, urlSansParam);
        location.reload();
    });

    let cible = 100;      // Valeur finale
    let duree = 2000;     // Durée en ms (ici 2 secondes)

    $({ countNum: 0 }).animate({ countNum: cible }, {
        duration: duree,
        easing: 'swing',
        step: function () {
            $('#compteur').text(Math.floor(this.countNum));
        },
        complete: function () {
            $('#compteur').text(this.countNum); // Arrondi final
        }
    });
}