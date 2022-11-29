export default {
    onload: ({ extensionAPI }) => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
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

        window.roamAlphaAPI.ui.commandPalette.addCommand({
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
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
            window.roamjs.extension.smartblocks.registerCommand(args1);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args) &&
                    window.roamjs.extension.smartblocks.registerCommand(args1)
            );
        }
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Random Poem from Poemist'
        });
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Random Poem from PoetryDB'
        });
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("POEMIST");
            window.roamjs.extension.smartblocks.unregisterCommand("POETRYDB");
        }
    }
}

async function fetchRandomPoemist() {
    const response = await fetch("https://www.poemist.com/api/v1/randompoems");
    console.info(response);
    const data = await response.json();
    console.info(data);
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