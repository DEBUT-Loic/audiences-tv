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
    let total = data.length;
    data.forEach((elem) => {
        const idDiv =
        rang === 1 ? "premier" :
        rang === 2 ? "deuxieme" :
        rang === 3 ? "troisieme" :
        rang < total - 2 ? "milieu" : "fin";

        if(rang < 4) {
            // podium
            $(`#${idDiv} img`).attr("src",`img/${srcImg(elem.chaine)}.png`).attr("alt",elem.chaine);
            $(`#${idDiv} .programme`).text(elem.programme);
            $(`#${idDiv} .audience`).text(numStr(elem.audience));
            $(`#${idDiv} .pda`).text(elem.pda);
        }
        else if(rang === 4) {
            $(`#classement`).prepend(`
                <div>
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
                <div class="${idDiv} ${rang == total-3 ? "last-milieu" : ""}">
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

        // tr.setAttribute("class",classTr);

        // stringHTML += `
        //     <td class="rang">${rang==1 ? rang+"<sup>er</sup>" : rang+"<sup>e</sup>"}</td>
        //     <td class="chaine"> <img src="img/${srcImg(elem.chaine)}.png" alt="${elem.chaine}" /> </td>
        //     <td class="programme">${elem.programme}</td>
        //     <td class="telespectateur">${numStr(elem.audience)}</td>
        //     <td class="pda">${elem.pda}</td>
        //     `;

        rang++;
    });
}

// window.addEventListener('DOMContentLoaded',loadLinks);

window.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadLinks();
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});