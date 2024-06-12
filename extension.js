export default {
    onload: ({ extensionAPI }) => {
        /*
        extensionAPI.ui.commandPalette.addCommand({
            label: "Random Poem from Poemist",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing a poem");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchRandomPoemist().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                    for (var i = 0; i < blocks[0].children.length; i++) {
                        var thisBlock = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: i + 1 },
                            block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                        });
                    }
                });
            }
        });
        */

        extensionAPI.ui.commandPalette.addCommand({
            label: "Random Poem from PoetryDB",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing a poem");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchRandomPoetryDB().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                    for (var i = 0; i < blocks[0].children.length; i++) {
                        var thisBlock = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: i + 1 },
                            block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                        });
                    }
                });
            }
        });
/*
        extensionAPI.ui.commandPalette.addCommand({
            label: "Poem-a-Day from Poets.org",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing a poem");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchPaD().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                    for (var i = 0; i < blocks[0].children.length; i++) {
                        var thisBlock = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: i + 1 },
                            block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                        });
                    };
                });
            }
        });
        */

        const args = {
            text: "POEMIST",
            help: "Import a random poem from the Poemist API",
            handler: (context) => fetchRandomPoemist,
        };
        const args1 = {
            text: "POETRYDB",
            help: "Import a random poem from the PoetryDB API",
            handler: (context) => fetchRandomPoetryDB,
        };
        const args2 = {
            text: "POEMADAY",
            help: "Import the Poem-a-Day from Poets.org",
            handler: (context) => fetchPaD,
        };
        if (window.roamjs?.extension?.smartblocks) {
            //window.roamjs.extension.smartblocks.registerCommand(args);
            window.roamjs.extension.smartblocks.registerCommand(args1);
            //window.roamjs.extension.smartblocks.registerCommand(args2);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                  //  window.roamjs.extension.smartblocks.registerCommand(args) &&
                    window.roamjs.extension.smartblocks.registerCommand(args1)
                  //  window.roamjs.extension.smartblocks.registerCommand(args2)
            );
        }
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
           // window.roamjs.extension.smartblocks.unregisterCommand("POEMIST");
            window.roamjs.extension.smartblocks.unregisterCommand("POETRYDB");
           // window.roamjs.extension.smartblocks.unregisterCommand("POEMADAY");
        }
    }
}

async function fetchRandomPoemist() {
    const response = await fetch("https://www.poemist.com/api/v1/randompoems");
    const data = await response.json();
    if (response.ok) {
        let poet = data[0].poet.name.toString();
        let title = data[0].title.toString();
        let url = data[0].url.toString();
        let poem = data[0].content.toString();
        let poemBlocks = poem.split("\n\n");
        let poemBlockOutput = [];
        for (var i = 0; i < poemBlocks.length; i++) {
            poemBlockOutput.push({ "text": poemBlocks[i] });
        }
        poemBlockOutput.push({ "text": "[" + title + "](" + url + ")" })
        return [
            {
                text: "**[[" + title + "]]** by [[" + poet + "]]",
                children: poemBlockOutput
            },
        ];
    } else {
        return [
            {
                text: "Import from Poemist failed",
            },
        ];
        console.error(data);
    }
};

async function fetchRandomPoetryDB() {
    const response = await fetch("https://poetrydb.org/random");
    const data = await response.json();
    if (response.ok) {
        let poet = data[0].author.toString();
        let title = data[0].title.toString();
        let poemLines = data[0].lines;
        let poemBlockOutput = [];
        for (var i = 0; i < poemLines.length; i++) {
            poemLines[i].replaceAll("`", "'");
            poemBlockOutput.push({ "text": poemLines[i].toString() });
        }
        return [
            {
                text: "**[[" + title + "]]** by [[" + poet + "]]",
                children: poemBlockOutput
            },
        ];
    } else {
        return [
            {
                text: "Import from PoetryDB failed",
            },
        ];
        console.error(data);
    }
};

async function fetchPaD() {
    const response = await fetch("https://p-a-d-marklavercombe.replit.app/");

    if (response.ok) {
        var data = await response.json();
        data = JSON.parse(data);
        let poet = data[0].poet.name.toString();
        let title = data[0].poem.title.toString();
        let attrib = data[0].poem.attribution.toString();
        attrib = attrib.replace("<p>", "");
        attrib = attrib.replace("</p>", "");
        attrib = attrib.replaceAll("<span>", "");
        attrib = attrib.replaceAll("</span>", "");
        attrib = attrib.replaceAll("&nbsp;", "");
        const regex = /(<p>)?<span class=("long line"|"long-line")>(.+)<\/span>(<\/p>|<br \/>)/mg;
        const subst = `$3`;
        const result = data[0].poem.text.toString().replace(regex, subst);
        var result1 = result.replaceAll("\r", "");
        let poemBlocks = result1.split("\n");

        let poemBlockOutput = [];
        for (var i = 0; i < poemBlocks.length; i++) {
            if (i == (poemBlocks.length - 1)) {
                if (poemBlocks[i].trim().toString() != "") {
                    let thisstring = strip(poemBlocks[i].trim().toString());
                    poemBlockOutput.push({ "text": thisstring.replace(/[“”]/g, '"').replace(/[‘’]/g, "'") });
                }
            } else {
                let thisstring = strip(poemBlocks[i].trim().toString());
                poemBlockOutput.push({ "text": thisstring.replace(/[“”]/g, '"').replace(/[‘’]/g, "'") });
            }
        }
        poemBlockOutput.push({ "text": "---" });
        if (data[0].poem.hasOwnProperty("about") && data[0].poem.about != "") {
            let about = strip(data[0].poem.about.toString());
            poemBlockOutput.push({ "text": about });
        }
        poemBlockOutput.push({ "text": attrib });
        
        if (data[0].poem.soundcloud != null) {
            let sc = data[0].poem.soundcloud.toString();
            const scRegex = /^.+(https:\/\/playlist\.megaphone\.fm\/\?e=\w+)".+$/g;
            const scSubst = `$1`;
            const scResult = sc.replace(scRegex, scSubst);
            //poemBlockOutput.push({ "text": "{{iframe: " + scResult + "}} #PAD_wide" });
            // appears to throw errors at present, investigation why
        }
        return [
            {
                text: "**[[" + title + "]]** by [[" + poet + "]]",
                children: poemBlockOutput
            },
        ];
    } else {
        return [
            {
                text: "Import of Poem-a-Day failed",
            },
        ];
        console.error(data);
    }
};

function strip(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}