let latogatok = [];
let telefonok = [];
let kilepesek = [];
let szolgalatok = [];
let naplo = [];
let uzenetek = [];
let toastTimer = null;

// A korabban elmentett adatokat olvassa be.
function taroltAdatokBetoltese(kulcs) {
    try {
        const adat = localStorage.getItem(kulcs);

        if (adat === null) {
            return [];
        }

        const feldolgozottAdat = JSON.parse(adat);

        if (Array.isArray(feldolgozottAdat)) {
            return feldolgozottAdat.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
        }

        return [];
    } catch (hiba) {
        return [];
    }
}

function adatokBetoltese() {
    latogatok = taroltAdatokBetoltese("mechwart_latogatok");
    telefonok = taroltAdatokBetoltese("mechwart_telefonok");
    kilepesek = taroltAdatokBetoltese("mechwart_kilepesek");
    szolgalatok = taroltAdatokBetoltese("mechwart_szolgalatok");
    naplo = taroltAdatokBetoltese("mechwart_naplo");
    uzenetek = taroltAdatokBetoltese("mechwart_uzenetek");
}

// Minden adatot ugyanoda mentunk, ahonnan betoltjuk.
function adatokMentese() {
    try {
        localStorage.setItem("mechwart_latogatok", JSON.stringify(latogatok));
        localStorage.setItem("mechwart_telefonok", JSON.stringify(telefonok));
        localStorage.setItem("mechwart_kilepesek", JSON.stringify(kilepesek));
        localStorage.setItem("mechwart_szolgalatok", JSON.stringify(szolgalatok));
        localStorage.setItem("mechwart_naplo", JSON.stringify(naplo));
        localStorage.setItem("mechwart_uzenetek", JSON.stringify(uzenetek));
        return true;
    } catch (hiba) {
        uzenetMutatasa("A mentés nem sikerült. Ellenőrizzétek a böngésző tárhelyét.");
        return false;
    }
}

function ujAzonosito() {
    return String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000));
}

function aktualisIdoAdatok() {
    const most = new Date();
    const honap = String(most.getMonth() + 1).padStart(2, "0");
    const nap = String(most.getDate()).padStart(2, "0");

    return {
        datumIdo: most.toLocaleString("hu-HU"),
        createdAt: most.getTime(),
        datumKulcs: most.getFullYear() + "-" + honap + "-" + nap
    };
}

function datumIdo(szoveg) {
    return szoveg || "-";
}

function maiDatumKulcs() {
    const most = new Date();
    const honap = String(most.getMonth() + 1).padStart(2, "0");
    const nap = String(most.getDate()).padStart(2, "0");
    return most.getFullYear() + "-" + honap + "-" + nap;
}

// A regebbi bejegyzeseknel meg nincs datumKulcs, ezert az azonositojukbol probaljuk kinyerni a datumot.
function rekordDatumKulcs(rekord) {
    if (rekord.datumKulcs) {
        return rekord.datumKulcs;
    }

    const idobelyeg = Number(rekord.createdAt) || parseInt(rekord.id, 10);

    if (!idobelyeg || isNaN(idobelyeg)) {
        return "";
    }

    const datum = new Date(idobelyeg);
    const honap = String(datum.getMonth() + 1).padStart(2, "0");
    const nap = String(datum.getDate()).padStart(2, "0");

    return datum.getFullYear() + "-" + honap + "-" + nap;
}

function ujAzonositoSzam(rekord) {
    if (rekord.createdAt) {
        return Number(rekord.createdAt);
    }

    const regiAzonosito = parseInt(rekord.id, 10);

    if (!isNaN(regiAzonosito)) {
        return regiAzonosito;
    }

    return 0;
}

function uzenetMutatasa(szoveg) {
    const elem = document.getElementById("toast");

    if (!elem) {
        return;
    }

    elem.textContent = szoveg;
    elem.classList.add("lathato");

    if (toastTimer !== null) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(function () {
        elem.classList.remove("lathato");
    }, 2500);
}

function biztonsagosSzoveg(szoveg) {
    return String(szoveg === undefined || szoveg === null ? "" : szoveg).replace(/[&<>"']/g, function (karakter) {
        const karakterek = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return karakterek[karakter];
    });
}

// A keresés az ekezet nelkuli irast is elfogadja.
function kereshetoSzoveg(szoveg) {
    return String(szoveg || "")
        .toLocaleLowerCase("hu")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function egyezikKeresessel(rekordSzovege, keresesiSzoveg) {
    return kereshetoSzoveg(rekordSzovege).includes(kereshetoSzoveg(keresesiSzoveg));
}

function uresTabla(tbodyId, oszlopok, szoveg) {
    document.getElementById(tbodyId).innerHTML =
        '<tr><td colspan="' + oszlopok + '" class="ures-sor">' + biztonsagosSzoveg(szoveg) + '</td></tr>';
}

function frissitMindent() {
    latogatokMegjelenitese();
    telefonokMegjelenitese();
    kilepesekMegjelenitese();
    szolgalatokMegjelenitese();
    naploMegjelenitese();
    uzenetekMegjelenitese();
    dashboardFrissitese();
}

function dashboardFrissitese() {
    const aktivLatogatok = latogatok.filter(function (latogato) {
        return !latogato.tavozott;
    }).length;

    const varakozoTelefonok = telefonok.filter(function (telefon) {
        return !telefon.visszaadva;
    }).length;

    const maiKilepesek = kilepesek.filter(function (kilepes) {
        return rekordDatumKulcs(kilepes) === maiDatumKulcs();
    }).length;

    const varakozoUzenetek = uzenetek.filter(function (uzenet) {
        return !uzenet.atadva;
    }).length;

    document.getElementById("statVisitors").textContent = aktivLatogatok;
    document.getElementById("statPhones").textContent = varakozoTelefonok;
    document.getElementById("statExits").textContent = maiKilepesek;
    document.getElementById("statMessages").textContent = varakozoUzenetek;

    const esemenyek = [];

    latogatok.forEach(function (latogato) {
        esemenyek.push({
            cim: latogato.tavozott ? "Látogató távozott" : "Látogató érkezett",
            reszlet: latogato.nev + " · " + (latogato.kitKeres || ""),
            ido: latogato.modositvaIdo || latogato.erkezes || latogato.ido,
            idobelyeg: latogato.modositva || ujAzonositoSzam(latogato)
        });
    });

    telefonok.forEach(function (telefon) {
        esemenyek.push({
            cim: telefon.visszaadva ? "Telefon visszaadva" : "Telefon átvétele",
            reszlet: telefon.nev + " · " + (telefon.osztaly || ""),
            ido: telefon.modositvaIdo || telefon.ido,
            idobelyeg: telefon.modositva || ujAzonositoSzam(telefon)
        });
    });

    kilepesek.forEach(function (kilepes) {
        esemenyek.push({
            cim: "Diák kilépése rögzítve",
            reszlet: kilepes.nev + " · " + (kilepes.osztaly || ""),
            ido: kilepes.datumIdo || kilepes.ido,
            idobelyeg: ujAzonositoSzam(kilepes)
        });
    });

    szolgalatok.forEach(function (diak) {
        esemenyek.push({
            cim: diak.jelen ? "Szolgálatos diák jelen van" : "Szolgálati beosztás rögzítve",
            reszlet: diak.nev + " · " + (diak.osztaly || ""),
            ido: diak.modositvaIdo || diak.datumIdo || diak.idopont,
            idobelyeg: diak.modositva || ujAzonositoSzam(diak)
        });
    });

    naplo.forEach(function (bejegyzes) {
        esemenyek.push({
            cim: "Naplóbejegyzés: " + bejegyzes.tipus,
            reszlet: bejegyzes.leiras,
            ido: bejegyzes.datumIdo || bejegyzes.ido,
            idobelyeg: ujAzonositoSzam(bejegyzes)
        });
    });

    uzenetek.forEach(function (uzenet) {
        esemenyek.push({
            cim: uzenet.atadva ? "Üzenet átadva" : "Új üzenet rögzítve",
            reszlet: uzenet.cimzett,
            ido: uzenet.modositvaIdo || uzenet.datumIdo || uzenet.ido,
            idobelyeg: uzenet.modositva || ujAzonositoSzam(uzenet)
        });
    });

    esemenyek.sort(function (a, b) {
        return b.idobelyeg - a.idobelyeg;
    });

    const lista = document.getElementById("recentActivity");

    if (esemenyek.length === 0) {
        lista.textContent = "Még nincs rögzített esemény.";
        return;
    }

    lista.innerHTML = esemenyek.slice(0, 7).map(function (esemeny) {
        return '<div class="lista-elem">' +
            '<strong>' + biztonsagosSzoveg(esemeny.cim) + '</strong>' +
            '<p>' + biztonsagosSzoveg(esemeny.reszlet) + '</p>' +
            '<small>' + biztonsagosSzoveg(datumIdo(esemeny.ido)) + '</small>' +
            '</div>';
    }).join("");
}

function oldalMegnyitasa(oldalNeve) {
    document.querySelectorAll(".oldal").forEach(function (oldal) {
        oldal.classList.remove("aktiv");
    });

    document.querySelectorAll(".menu-gomb").forEach(function (gomb) {
        gomb.classList.remove("aktiv");
    });

    const kivalasztottOldal = document.getElementById("page-" + oldalNeve);
    const kivalasztottGomb = document.querySelector('[data-page="' + oldalNeve + '"]');

    if (kivalasztottOldal) {
        kivalasztottOldal.classList.add("aktiv");
    }

    if (kivalasztottGomb) {
        kivalasztottGomb.classList.add("aktiv");
        document.getElementById("breadcrumbText").textContent = kivalasztottGomb.textContent;
    }
}

function latogatokMegjelenitese() {
    const keresesiSzoveg = document.getElementById("visitorSearch").value;
    const szuro = document.getElementById("visitorFilter").value;
    let lista = latogatok.slice();

    if (szuro === "active") {
        lista = lista.filter(function (latogato) { return !latogato.tavozott; });
    } else if (szuro === "left") {
        lista = lista.filter(function (latogato) { return latogato.tavozott; });
    }

    lista = lista.filter(function (latogato) {
        return egyezikKeresessel(latogato.nev + " " + latogato.kitKeres + " " + latogato.cel, keresesiSzoveg);
    });

    lista.sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    const aktivDb = latogatok.filter(function (latogato) { return !latogato.tavozott; }).length;
    document.getElementById("visitorCount").textContent = aktivDb + " fő bent";

    if (lista.length === 0) {
        uresTabla("visitorTable", 7, "Nincs a keresésnek megfelelő látogató.");
        return;
    }

    document.getElementById("visitorTable").innerHTML = lista.map(function (latogato) {
        const tavozott = Boolean(latogato.tavozott);
        const gombSzoveg = tavozott ? "Visszaállítás" : "Távozás rögzítése";

        return '<tr>' +
            '<td>' + biztonsagosSzoveg(latogato.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(latogato.kitKeres) + '</td>' +
            '<td>' + biztonsagosSzoveg(latogato.cel || "-") + '</td>' +
            '<td>' + biztonsagosSzoveg(latogato.erkezes || latogato.ido) + '</td>' +
            '<td>' + biztonsagosSzoveg(latogato.tavozas || "-") + '</td>' +
            '<td><span class="allapot ' + (tavozott ? "kesz" : "aktiv-allapot") + '">' + (tavozott ? "Távozott" : "Bent van") + '</span></td>' +
            '<td><button class="kis-gomb" type="button" data-action="visitor-toggle" data-id="' + biztonsagosSzoveg(latogato.id) + '">' + gombSzoveg + '</button> ' +
            '<button class="kis-gomb torles-gomb" type="button" data-action="visitor-delete" data-id="' + biztonsagosSzoveg(latogato.id) + '">Törlés</button></td>' +
            '</tr>';
    }).join("");
}

function telefonokMegjelenitese() {
    const keresesiSzoveg = document.getElementById("phoneSearch").value;
    const szuro = document.getElementById("phoneFilter").value;
    let lista = telefonok.slice();

    if (szuro === "waiting") {
        lista = lista.filter(function (telefon) { return !telefon.visszaadva; });
    } else if (szuro === "returned") {
        lista = lista.filter(function (telefon) { return telefon.visszaadva; });
    }

    lista = lista.filter(function (telefon) {
        return egyezikKeresessel(telefon.nev + " " + telefon.osztaly + " " + telefon.hely, keresesiSzoveg);
    });

    lista.sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    const varakozoDb = telefonok.filter(function (telefon) { return !telefon.visszaadva; }).length;
    document.getElementById("phoneCount").textContent = varakozoDb + " db vár visszaadásra";

    if (lista.length === 0) {
        uresTabla("phoneTable", 7, "Nincs a keresésnek megfelelő telefon.");
        return;
    }

    document.getElementById("phoneTable").innerHTML = lista.map(function (telefon) {
        const visszaadva = Boolean(telefon.visszaadva);
        const gombSzoveg = visszaadva ? "Visszavonás" : "Visszaadás rögzítése";

        return '<tr>' +
            '<td>' + biztonsagosSzoveg(telefon.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.osztaly) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.hely) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.ido) + '</td>' +
            '<td>' + biztonsagosSzoveg(telefon.visszaadasIdeje || "-") + '</td>' +
            '<td><span class="allapot ' + (visszaadva ? "kesz" : "varakozik") + '">' + (visszaadva ? "Visszaadva" : "Tárolva") + '</span></td>' +
            '<td><button class="kis-gomb" type="button" data-action="phone-toggle" data-id="' + biztonsagosSzoveg(telefon.id) + '">' + gombSzoveg + '</button> ' +
            '<button class="kis-gomb torles-gomb" type="button" data-action="phone-delete" data-id="' + biztonsagosSzoveg(telefon.id) + '">Törlés</button></td>' +
            '</tr>';
    }).join("");
}

function kilepesekMegjelenitese() {
    const keresesiSzoveg = document.getElementById("exitSearch").value;
    const lista = kilepesek.filter(function (kilepes) {
        return egyezikKeresessel(kilepes.nev + " " + kilepes.osztaly + " " + kilepes.engedelyezo + " " + kilepes.ok, keresesiSzoveg);
    }).sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    document.getElementById("exitCount").textContent = kilepesek.length + " db";

    if (lista.length === 0) {
        uresTabla("exitTable", 6, "Nincs a keresésnek megfelelő kilépés.");
        return;
    }

    document.getElementById("exitTable").innerHTML = lista.map(function (kilepes) {
        return '<tr>' +
            '<td>' + biztonsagosSzoveg(kilepes.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(kilepes.osztaly) + '</td>' +
            '<td>' + biztonsagosSzoveg(kilepes.ok) + '</td>' +
            '<td>' + biztonsagosSzoveg(kilepes.datumIdo || kilepes.ido) + '</td>' +
            '<td>' + biztonsagosSzoveg(kilepes.engedelyezo) + '</td>' +
            '<td><button class="kis-gomb torles-gomb" type="button" data-action="exit-delete" data-id="' + biztonsagosSzoveg(kilepes.id) + '">Törlés</button></td>' +
            '</tr>';
    }).join("");
}

function szolgalatokMegjelenitese() {
    const keresesiSzoveg = document.getElementById("dutySearch").value;
    const lista = szolgalatok.filter(function (diak) {
        return egyezikKeresessel(diak.nev + " " + diak.osztaly + " " + diak.idopont, keresesiSzoveg);
    }).sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    document.getElementById("dutyCount").textContent = szolgalatok.length + " fő beosztva";

    if (lista.length === 0) {
        uresTabla("dutyTable", 5, "Nincs a keresésnek megfelelő beosztás.");
        return;
    }

    document.getElementById("dutyTable").innerHTML = lista.map(function (diak) {
        const gombSzoveg = diak.jelen ? "Jelenlét visszavonása" : "Jelenlét jelölése";

        return '<tr>' +
            '<td>' + biztonsagosSzoveg(diak.nev) + '</td>' +
            '<td>' + biztonsagosSzoveg(diak.osztaly) + '</td>' +
            '<td>' + biztonsagosSzoveg(diak.idopont) + '</td>' +
            '<td><span class="allapot ' + (diak.jelen ? "kesz" : "varakozik") + '">' + (diak.jelen ? "Jelen van" : "Még nem jelent meg") + '</span></td>' +
            '<td><button class="kis-gomb" type="button" data-action="duty-toggle" data-id="' + biztonsagosSzoveg(diak.id) + '">' + gombSzoveg + '</button> ' +
            '<button class="kis-gomb torles-gomb" type="button" data-action="duty-delete" data-id="' + biztonsagosSzoveg(diak.id) + '">Törlés</button></td>' +
            '</tr>';
    }).join("");
}

function naploMegjelenitese() {
    const keresesiSzoveg = document.getElementById("logSearch").value;
    const lista = naplo.filter(function (bejegyzes) {
        return egyezikKeresessel(bejegyzes.tipus + " " + bejegyzes.leiras, keresesiSzoveg);
    }).sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    document.getElementById("logCount").textContent = naplo.length + " db";
    const listaElem = document.getElementById("logList");

    if (lista.length === 0) {
        listaElem.innerHTML = "<p>Még nincs a keresésnek megfelelő naplóbejegyzés.</p>";
        return;
    }

    listaElem.innerHTML = lista.map(function (bejegyzes) {
        return '<div class="lista-elem">' +
            '<div class="lista-fejlec"><strong>' + biztonsagosSzoveg(bejegyzes.tipus) + '</strong>' +
            '<button class="kis-gomb torles-gomb" type="button" data-action="log-delete" data-id="' + biztonsagosSzoveg(bejegyzes.id) + '">Törlés</button></div>' +
            '<small>' + biztonsagosSzoveg(bejegyzes.datumIdo || bejegyzes.ido) + '</small>' +
            '<p>' + biztonsagosSzoveg(bejegyzes.leiras) + '</p>' +
            '</div>';
    }).join("");
}

function uzenetekMegjelenitese() {
    const keresesiSzoveg = document.getElementById("messageSearch").value;
    const szuro = document.getElementById("messageFilter").value;
    let lista = uzenetek.slice();

    if (szuro === "pending") {
        lista = lista.filter(function (uzenet) { return !uzenet.atadva; });
    } else if (szuro === "done") {
        lista = lista.filter(function (uzenet) { return uzenet.atadva; });
    }

    lista = lista.filter(function (uzenet) {
        return egyezikKeresessel(uzenet.cimzett + " " + uzenet.szoveg, keresesiSzoveg);
    }).sort(function (a, b) { return ujAzonositoSzam(b) - ujAzonositoSzam(a); });

    const varakozoDb = uzenetek.filter(function (uzenet) { return !uzenet.atadva; }).length;
    document.getElementById("messageCount").textContent = varakozoDb + " db vár átadásra";
    const listaElem = document.getElementById("messageList");

    if (lista.length === 0) {
        listaElem.innerHTML = "<p>Nincs a keresésnek megfelelő üzenet.</p>";
        return;
    }

    listaElem.innerHTML = lista.map(function (uzenet) {
        const atadva = Boolean(uzenet.atadva);
        const gombSzoveg = atadva ? "Átadás visszavonása" : "Átadva";

        return '<div class="lista-elem">' +
            '<div class="lista-fejlec"><strong>' + biztonsagosSzoveg(uzenet.cimzett) + '</strong>' +
            '<button class="kis-gomb torles-gomb" type="button" data-action="message-delete" data-id="' + biztonsagosSzoveg(uzenet.id) + '">Törlés</button></div>' +
            '<small>' + biztonsagosSzoveg(uzenet.datumIdo || uzenet.ido) + '</small>' +
            '<p>' + biztonsagosSzoveg(uzenet.szoveg) + '</p>' +
            '<div class="lista-alja"><span class="allapot ' + (atadva ? "kesz" : "varakozik") + '">' + (atadva ? "Átadva" : "Átadásra vár") + '</span>' +
            '<button class="kis-gomb" type="button" data-action="message-toggle" data-id="' + biztonsagosSzoveg(uzenet.id) + '">' + gombSzoveg + '</button></div>' +
            '</div>';
    }).join("");
}

function kotelezoMezokEllenorzese(form) {
    const kotelezoMezok = form.querySelectorAll("[required]");

    for (let i = 0; i < kotelezoMezok.length; i++) {
        if (kotelezoMezok[i].value.trim() === "") {
            uzenetMutatasa("Kérlek, tölts ki minden kötelező mezőt!");
            kotelezoMezok[i].focus();
            return false;
        }
    }

    return true;
}

function ujRekordAlapAdatok() {
    const idoAdatok = aktualisIdoAdatok();

    return {
        id: ujAzonosito(),
        createdAt: idoAdatok.createdAt,
        datumKulcs: idoAdatok.datumKulcs,
        datumIdo: idoAdatok.datumIdo
    };
}

// Uj latogato rogzitese.
document.getElementById("visitorForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const latogato = ujRekordAlapAdatok();
    latogato.nev = document.getElementById("visitorName").value.trim();
    latogato.kitKeres = document.getElementById("visitorHost").value.trim();
    latogato.cel = document.getElementById("visitorReason").value;
    latogato.erkezes = latogato.datumIdo;
    latogato.tavozott = false;

    latogatok.push(latogato);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("A látogató rögzítése sikerült.");
    }
});

// Telefon atvetele.
document.getElementById("phoneForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const telefon = ujRekordAlapAdatok();
    telefon.nev = document.getElementById("phoneStudent").value.trim();
    telefon.osztaly = document.getElementById("phoneClass").value.trim();
    telefon.hely = document.getElementById("phonePlace").value.trim();
    telefon.ido = telefon.datumIdo;
    telefon.visszaadva = false;

    telefonok.push(telefon);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("A telefon átvétele rögzítve.");
    }
});

// Engedelyezett diak kilepes rogzitese.
document.getElementById("exitForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const kilepes = ujRekordAlapAdatok();
    kilepes.nev = document.getElementById("exitStudent").value.trim();
    kilepes.osztaly = document.getElementById("exitClass").value.trim();
    kilepes.engedelyezo = document.getElementById("exitAuthorizer").value.trim();
    kilepes.ok = document.getElementById("exitReason").value.trim();
    kilepes.ido = kilepes.datumIdo;

    kilepesek.push(kilepes);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("A kilépés rögzítve.");
    }
});

// Portai szolgalatos diak beosztasa.
document.getElementById("dutyForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const diak = ujRekordAlapAdatok();
    diak.nev = document.getElementById("dutyName").value.trim();
    diak.osztaly = document.getElementById("dutyClass").value.trim();
    diak.idopont = document.getElementById("dutyTime").value.trim();
    diak.jelen = false;

    szolgalatok.push(diak);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("A szolgálati beosztás rögzítve.");
    }
});

// Uj naplob bejegyzes rogzitese.
document.getElementById("logForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const bejegyzes = ujRekordAlapAdatok();
    bejegyzes.tipus = document.getElementById("logType").value;
    bejegyzes.leiras = document.getElementById("logDescription").value.trim();
    bejegyzes.ido = bejegyzes.datumIdo;

    naplo.push(bejegyzes);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("A naplóbejegyzés mentve.");
    }
});

// Uj uzenet rogzitese.
document.getElementById("messageForm").addEventListener("submit", function (esemeny) {
    esemeny.preventDefault();

    if (!kotelezoMezokEllenorzese(this)) {
        return;
    }

    const uzenet = ujRekordAlapAdatok();
    uzenet.cimzett = document.getElementById("messageTo").value.trim();
    uzenet.szoveg = document.getElementById("messageText").value.trim();
    uzenet.ido = uzenet.datumIdo;
    uzenet.atadva = false;

    uzenetek.push(uzenet);

    if (adatokMentese()) {
        frissitMindent();
        this.reset();
        uzenetMutatasa("Az üzenet rögzítve.");
    }
});

function rekordKeresese(lista, id) {
    return lista.find(function (elem) {
        return String(elem.id) === String(id);
    });
}

function rekordTorlese(lista, id) {
    const index = lista.findIndex(function (elem) {
        return String(elem.id) === String(id);
    });

    if (index !== -1) {
        lista.splice(index, 1);
        return true;
    }

    return false;
}

// Az osszes tablazat muveletgombjat egy helyen kezeljuk.
document.addEventListener("click", function (esemeny) {
    if (!esemeny.target.closest) {
        return;
    }

    const gomb = esemeny.target.closest("[data-action]");

    if (!gomb) {
        return;
    }

    const id = gomb.dataset.id;
    const muvelet = gomb.dataset.action;
    let valtozott = false;
    let visszajelzes = "A módosítás mentve.";

    if (muvelet === "visitor-toggle") {
        const latogato = rekordKeresese(latogatok, id);

        if (latogato) {
            latogato.tavozott = !latogato.tavozott;
            const ido = aktualisIdoAdatok();
            latogato.modositva = ido.createdAt;
            latogato.modositvaIdo = ido.datumIdo;
            latogato.tavozas = latogato.tavozott ? ido.datumIdo : "";
            visszajelzes = latogato.tavozott ? "A látogató távozása rögzítve." : "A látogató újra aktívként szerepel.";
            valtozott = true;
        }
    } else if (muvelet === "phone-toggle") {
        const telefon = rekordKeresese(telefonok, id);

        if (telefon) {
            telefon.visszaadva = !telefon.visszaadva;
            const ido = aktualisIdoAdatok();
            telefon.modositva = ido.createdAt;
            telefon.modositvaIdo = ido.datumIdo;
            telefon.visszaadasIdeje = telefon.visszaadva ? ido.datumIdo : "";
            visszajelzes = telefon.visszaadva ? "A telefon visszaadása rögzítve." : "A telefon visszaadása visszavonva.";
            valtozott = true;
        }
    } else if (muvelet === "duty-toggle") {
        const diak = rekordKeresese(szolgalatok, id);

        if (diak) {
            diak.jelen = !diak.jelen;
            const ido = aktualisIdoAdatok();
            diak.modositva = ido.createdAt;
            diak.modositvaIdo = ido.datumIdo;
            diak.jelenletIdeje = diak.jelen ? ido.datumIdo : "";
            visszajelzes = diak.jelen ? "A jelenlét rögzítve." : "A jelenlét visszavonva.";
            valtozott = true;
        }
    } else if (muvelet === "message-toggle") {
        const uzenet = rekordKeresese(uzenetek, id);

        if (uzenet) {
            uzenet.atadva = !uzenet.atadva;
            const ido = aktualisIdoAdatok();
            uzenet.modositva = ido.createdAt;
            uzenet.modositvaIdo = ido.datumIdo;
            uzenet.atadasIdeje = uzenet.atadva ? ido.datumIdo : "";
            visszajelzes = uzenet.atadva ? "Az üzenet átadása rögzítve." : "Az átadás visszavonva.";
            valtozott = true;
        }
    } else {
        let lista = null;

        if (muvelet === "visitor-delete") lista = latogatok;
        if (muvelet === "phone-delete") lista = telefonok;
        if (muvelet === "exit-delete") lista = kilepesek;
        if (muvelet === "duty-delete") lista = szolgalatok;
        if (muvelet === "log-delete") lista = naplo;
        if (muvelet === "message-delete") lista = uzenetek;

        if (lista !== null && window.confirm("Biztosan törlöd ezt a bejegyzést?")) {
            valtozott = rekordTorlese(lista, id);
            visszajelzes = "A bejegyzés törölve.";
        }
    }

    if (valtozott) {
        if (adatokMentese()) {
            frissitMindent();
            uzenetMutatasa(visszajelzes);
        }
    }
});

// Biztonsagi mentes letoltese JSON fajlkent.
function adatokExportalasa() {
    const mentes = {
        alkalmazas: "PortaHub",
        verzio: 1,
        keszult: new Date().toISOString(),
        adatok: {
            latogatok: latogatok,
            telefonok: telefonok,
            kilepesek: kilepesek,
            szolgalatok: szolgalatok,
            naplo: naplo,
            uzenetek: uzenetek
        }
    };

    const fajl = new Blob([JSON.stringify(mentes, null, 2)], {
        type: "application/json"
    });
    const fajlCime = URL.createObjectURL(fajl);
    const letoltes = document.createElement("a");

    letoltes.href = fajlCime;
    letoltes.download = "portahub-mentes-" + maiDatumKulcs() + ".json";
    document.body.appendChild(letoltes);
    letoltes.click();
    document.body.removeChild(letoltes);

    setTimeout(function () {
        URL.revokeObjectURL(fajlCime);
    }, 1000);

    uzenetMutatasa("A biztonsági mentés letöltése elindult.");
}

// Korabban letoltott PortaHub mentes visszatoltese.
function adatokImportalasa(fajl) {
    if (!fajl) {
        return;
    }

    const olvaso = new FileReader();

    olvaso.onload = function () {
        try {
            const mentes = JSON.parse(olvaso.result);
            const adatok = mentes.adatok;
            const kulcsok = ["latogatok", "telefonok", "kilepesek", "szolgalatok", "naplo", "uzenetek"];

            if (mentes.alkalmazas !== "PortaHub" || !adatok || typeof adatok !== "object") {
                throw new Error("Nem PortaHub biztonsági mentés.");
            }

            for (let i = 0; i < kulcsok.length; i++) {
                if (!Array.isArray(adatok[kulcsok[i]])) {
                    throw new Error("A biztonsági mentés hiányos vagy hibás.");
                }
            }

            if (!window.confirm("A jelenlegi adatok lecserélődnek a kiválasztott biztonsági mentés adataira. Folytatod?")) {
                return;
            }

            const regiAdatok = {
                latogatok: latogatok,
                telefonok: telefonok,
                kilepesek: kilepesek,
                szolgalatok: szolgalatok,
                naplo: naplo,
                uzenetek: uzenetek
            };

            latogatok = adatok.latogatok.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
            telefonok = adatok.telefonok.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
            kilepesek = adatok.kilepesek.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
            szolgalatok = adatok.szolgalatok.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
            naplo = adatok.naplo.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });
            uzenetek = adatok.uzenetek.filter(function (elem) {
                return elem !== null && typeof elem === "object" && !Array.isArray(elem);
            });

            if (adatokMentese()) {
                frissitMindent();
                uzenetMutatasa("A biztonsági mentés visszaállítása sikerült.");
            } else {
                latogatok = regiAdatok.latogatok;
                telefonok = regiAdatok.telefonok;
                kilepesek = regiAdatok.kilepesek;
                szolgalatok = regiAdatok.szolgalatok;
                naplo = regiAdatok.naplo;
                uzenetek = regiAdatok.uzenetek;
                frissitMindent();
            }
        } catch (hiba) {
            uzenetMutatasa("Nem sikerült beolvasni a fájlt. Válasszatok PortaHub JSON mentést.");
        }
    };

    olvaso.onerror = function () {
        uzenetMutatasa("A fájl beolvasása nem sikerült.");
    };

    olvaso.readAsText(fajl, "UTF-8");
}

const mentesLetoltesGomb = document.getElementById("backupExport");
const mentesBetoltesMezo = document.getElementById("backupImport");

mentesLetoltesGomb.addEventListener("click", adatokExportalasa);
mentesBetoltesMezo.addEventListener("change", function () {
    if (this.files.length > 0) {
        adatokImportalasa(this.files[0]);
    }
    this.value = "";
});

// A menupontok es a dashboard gyorsgombjai kozotti valtas.
document.querySelectorAll(".menu-gomb").forEach(function (gomb) {
    gomb.addEventListener("click", function () {
        oldalMegnyitasa(gomb.dataset.page);
    });
});

document.querySelectorAll(".gyors-gomb").forEach(function (gomb) {
    gomb.addEventListener("click", function () {
        oldalMegnyitasa(gomb.dataset.go);
    });
});

// Keresesek es szurok frissitik az adott listat.
[
    ["visitorSearch", latogatokMegjelenitese],
    ["phoneSearch", telefonokMegjelenitese],
    ["exitSearch", kilepesekMegjelenitese],
    ["dutySearch", szolgalatokMegjelenitese],
    ["logSearch", naploMegjelenitese],
    ["messageSearch", uzenetekMegjelenitese]
].forEach(function (elem) {
    document.getElementById(elem[0]).addEventListener("input", elem[1]);
});

[
    ["visitorFilter", latogatokMegjelenitese],
    ["phoneFilter", telefonokMegjelenitese],
    ["messageFilter", uzenetekMegjelenitese]
].forEach(function (elem) {
    document.getElementById(elem[0]).addEventListener("change", elem[1]);
});

// Ha masik bongeszolapon is tortenik modositas, frissitjuk az adatokat.
window.addEventListener("storage", function () {
    adatokBetoltese();
    frissitMindent();
});

// Indulaskor eloszor betoltjuk az adatokat, es csak utana jelenitjuk meg oket.
document.getElementById("todayText").textContent = new Date().toLocaleDateString("hu-HU");
adatokBetoltese();
frissitMindent();
