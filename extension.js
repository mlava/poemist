export default {
    onload: ({ extensionAPI }) => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Random Poem",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before importing a poem");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchRandomPoem().then(async (blocks) => {
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
            handler: (context) => fetchRandomPoem,
        };
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Random Poem'
        });
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("POEMIST");
        }
    }
}

async function fetchRandomPoem(uid) {
    const response = await fetch("https://www.poemist.com/api/v1/randompoems");
    const data = await response.json();
    if (response.ok) {
        let poet = data[0].poet.name.toString();
        let title = data[0].title.toString();
        let url = data[0].url.toString();
        let poem = data[0].content.toString();
        return [
            {
                text: "**[[" + title + "]]** by [[" + poet + "]]",
                children: [
                    { text: "" + poem + "" },
                    { text: "[" + title + "](" + url + ")" }
                ]
            },
        ];
    } else {
        console.error(data);
    }
};