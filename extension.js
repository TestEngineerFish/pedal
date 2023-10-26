// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { error } = require('console');
const vscode = require('vscode');
const fs = require('fs');
const { exec } = require('child_process');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pedal" is now active!');

	let cleanCache = vscode.commands.registerCommand('pedal.cleanCache', function () {
		var _terminal = vscode.window.createTerminal({name: "pedal",location:vscode.TerminalLocation.Editor});
		_terminal.show(false);
		deleteFlutterCache(_terminal);
	});

	context.subscriptions.push(cleanCache);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

// MARK: ==== Event ====
function deleteFlutterCache(_terminal) {
	if (vscode.workspace.workspaceFolders.length == 0) { return; }
	const projectRootPath = vscode.workspace.workspaceFolders[0].uri.path;
	const projectPubspecLockFile = `${projectRootPath}/pubspec.lock`;
	const examplePubspacLockFile = `${projectRootPath}/example/pubspec.lock`;

	_terminal.sendText(`cd ${projectRootPath}`);

	fs.access(projectPubspecLockFile, fs.constants.F_OK, (err) => {
		if (!err) {
			_terminal.sendText(`rm -rf ${projectPubspecLockFile}`);
		}
	});
	fs.access(examplePubspacLockFile, fs.constants.F_OK, (err) => {
		if (!err) {
			_terminal.sendText(`rm -rf ${examplePubspacLockFile}`);
		}
	});

	const cacheRootPath = vscode.workspace.getConfiguration("pedal").get('flutterCacheRootPath');
	if (!cacheRootPath.includes('.pub-cache')) { 
		vscode.window.showInformationMessage('获取Flutter缓存根目录地址失败 ❌');
		return;
	} else {
		_terminal.sendText(`rm -rf ${cacheRootPath}`);
		
		const projectPubspecPath = `${projectRootPath}/pubspec.yaml`;
		// const examplePubspacPath = `${projectRootPath}/example/pubspec.yaml`;
		
		fs.access(projectPubspecPath, fs.constants.F_OK, (err) => {
			if (!err) {
				_terminal.sendText(`flutter pub get`);
			}
			deletePodsCache(_terminal);
		});
	}
}

function deletePodsCache(_terminal) {

	// project cache 
	if (vscode.workspace.workspaceFolders.length == 0) { return; }
	const projectRootPath = vscode.workspace.workspaceFolders[0].uri.path;
	var projectIOSPath = `${projectRootPath}/example/ios`;
	
	if (!fs.existsSync(projectIOSPath)) {
		projectIOSPath = `${projectRootPath}/ios`;
	}
	
	const podsLockFile = `${projectIOSPath}/Podfile.lock`
	const podsPath = `${projectIOSPath}/Pods`
	fs.access(podsLockFile, fs.constants.F_OK, (err) => {
		if (err) {
			_terminal.sendText(`rm -rf ${podsLockFile}`);
		}
	});
	if (fs.existsSync(podsPath)) {
		_terminal.sendText(`rm -rf ${podsLockFile}`);
	}
	// system cache
	const rootPath = vscode.workspace.getConfiguration("pedal").get('podCacheRootPath');
	if (!rootPath.includes('CocoaPods')) { 
		vscode.window.showInformationMessage('获取Cocoapods缓存根目录地址失败 ❌');
	} else {
		if (fs.existsSync(rootPath)) {
			_terminal.sendText(`rm -rf ${rootPath}`);
		} 
		// get new data
		_terminal.sendText(`cd ${projectIOSPath}`);
		_terminal.sendText(`pod install`);
	}
}