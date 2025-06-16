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
                    if (blocks[0].hasOwnProperty("children")) {
                        for (var i = 0; i < blocks[0].children.length; i++) {
                            var thisBlock = window.roamAlphaAPI.util.generateUID();
                            await window.roamAlphaAPI.createBlock({
                                location: { "parent-uid": uid, order: i + 1 },
                                block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                            });
                        };
                    }
                });
            }
        });

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
            window.roamjs.extension.smartblocks.registerCommand(args2);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    //  window.roamjs.extension.smartblocks.registerCommand(args) &&
                    window.roamjs.extension.smartblocks.registerCommand(args1) &&
                    window.roamjs.extension.smartblocks.registerCommand(args2)
            );
        }
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            // window.roamjs.extension.smartblocks.unregisterCommand("POEMIST");
            window.roamjs.extension.smartblocks.unregisterCommand("POETRYDB");
            window.roamjs.extension.smartblocks.unregisterCommand("POEMADAY");
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
        console.error(data);
        return [
            {
                text: "Import from Poemist failed",
            },
        ];
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
        console.error(data);
        return [
            {
                text: "Import from PoetryDB failed",
            },
        ];
    }
};

async function fetchPaD() {
    const response = await fetch("https://fierce-mesa-62869-c6187e85bea8.herokuapp.com/poem-a-day");

    if (response.ok) {
        var data = await response.json();
        let poet = data.author.toString();
        let title = data.title.toString();
        let attrib = data.attribution.toString();

        let text = data.text;
        let poemBlocks = text.split("\n");

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
        poemBlockOutput.push({ "text": attrib });

        if (data.soundcloud != null) {
            let sc = data.soundcloud.toString();
            poemBlockOutput.push({ "text": "{{iframe: " + sc + "}} #PAD_wide" });
        }
        return [
            {
                text: "**[[" + title + "]]** by [[" + poet + "]]",
                children: poemBlockOutput
            },
        ];
    } else {
        console.error(data);
        return [
            {
                text: "Import of Poem-a-Day failed",
            },
        ];
    }
};

function strip(html) {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}