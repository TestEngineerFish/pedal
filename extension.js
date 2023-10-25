// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { error } = require('console');
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pedal" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pedal.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from pedal!');
	});

	const hover = vscode.languages.registerHoverProvider('json', {
		provideHover(document, position, token) {
			const fileName = document.fileName;
			const word = document.getText(document.getWordRangeAtPosition(position));
			return new vscode.Hover("悬停测试");
		}
	})
	let cleanCache = vscode.commands.registerCommand('pedal.cleanCache', function () {
		const rootPath = vscode.workspace.getConfiguration("pedal").get('customPath');
		const fs = require('fs');
		fs.readdir(rootPath, (err, files) => {
			if (err) {
				vscode.window.showInformationMessage('获取{path}下文件失败 ' + error);
			} else {
				files.forEach( file => {
					const filePath = '${rootPath}/${file}';
					fs.unlink(filePath, err => {
						if (err) {
							vscode.window.showInformationMessage('删除文件${file}失败 ' + error);
						} else {
							vscode.window.showInformationMessage('删除文件${file}成功 ' + error);
						}
					});
				});
			}
		});
	});

	context.subscriptions.push(disposable, hover, cleanCache);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
