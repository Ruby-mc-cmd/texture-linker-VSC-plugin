"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.linkTexture', async (uri) => {
        if (!uri) {
            vscode.window.showErrorMessage("No file selected.");
            return;
        }
        const texturePath = uri.fsPath;
        const match = texturePath.match(/assets[/\\]([^/\\]+)[/\\]textures[/\\]([^/\\]+)[/\\](.+)$/);
        if (!match) {
            vscode.window.showErrorMessage("Please select a file under assets/{namespace}/textures/{dir}/");
            return;
        }
        const namespace = match[1];
        const subDir = match[2];
        const rest = match[3].replace(/\\/g, "/");
        const restJson = rest.replace(/\.png$/, ".json");
        const restNoExt = rest.replace(/\.png$/, "");
        const assetsDir = texturePath.replace(/assets[/\\].+$/, "assets");
        const modelsPath = path.join(assetsDir, namespace, "models", "item", restJson);
        const itemsPath = path.join(assetsDir, namespace, "items", restJson);
        const modelJson = {
            parent: "item/generated",
            textures: {
                layer0: `${namespace}:${subDir}/${restNoExt}`
            }
        };
        const itemJson = {
            model: {
                type: "minecraft:model",
                model: `${namespace}:${subDir}/${restNoExt}`
            }
        };
        try {
            await createDirRecursive(modelsPath);
            await createDirRecursive(itemsPath);
            await vscode.workspace.fs.writeFile(vscode.Uri.file(modelsPath), Buffer.from(JSON.stringify(modelJson, null, 2)));
            await vscode.workspace.fs.writeFile(vscode.Uri.file(itemsPath), Buffer.from(JSON.stringify(itemJson, null, 2)));
            vscode.window.showInformationMessage("Model and item files generated successfully.");
        }
        catch (err) {
            vscode.window.showErrorMessage("Failed to generate files: " + String(err));
        }
    });
    context.subscriptions.push(disposable);
}
async function createDirRecursive(filePath) {
    const dir = path.dirname(filePath);
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dir));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map