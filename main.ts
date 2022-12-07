import { App, Plugin, PluginSettingTab, Setting, } from 'obsidian';


// Remember to rename these classes and interfaces!

interface MyObsidianLilyPondSettings {
	lilyPondFolderName: string;
	lilyPondLogLevel: string
}

const DEFAULT_SETTINGS: MyObsidianLilyPondSettings = {
	lilyPondFolderName: 'lilyPond',
	lilyPondLogLevel: 'INFO',
}

// Turns on/off console debug lines.
const DEBUG = true;

function log(msg)
{
	if (DEBUG)
		console.log(msg);
}

export default class MyPlugin extends Plugin {
	settings: MyObsidianLilyPondSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("lilypond", async (source, el, ctx) => {

			///////////////////////////////////////////////////////////////////////////////////////
			//	Empty Block Check
			///////////////////////////////////////////////////////////////////////////////////////

			if (source.trim().length == 0)
			{
				const lilyPondCachedDiv = el.createDiv();
				lilyPondCachedDiv.innerText = "Empty LilyPond block - Please add some LilyPond.";
				return;
			}

			///////////////////////////////////////////////////////////////////////////////////////
			//	First, let's identify the codeblock index of this lilypond source.
			//  This helps us generate unique .ly filenames futher down.
			///////////////////////////////////////////////////////////////////////////////////////


			const currentNote = this.app.workspace.getActiveFile();
			//@ts-ignore
			const noteText = await this.app.vault.read(currentNote); 

			const regex = new RegExp(/(?<=```lilypond)([^]*?)(?=```)/g);
			const matches = noteText.match(regex);

			//log("Matches\n" + matches);

			if (matches == null)
			{
				// Catastrophic failure - how is there no lilypond block?
				log("Somehow, there's no lilypond block in the file!");
				return
			}

			// Because there may be multiple lilyPond code blocks in the file and each one needs its own .ly file,
			// Let's identify what index codeblock is the one we're working with.
			let lpCodeBlockIndex;
			for (lpCodeBlockIndex = 0; lpCodeBlockIndex < matches.length; lpCodeBlockIndex++) {
				if (matches[lpCodeBlockIndex].trim() == source.trim())
				{
					log("Codeblock index match at:" + lpCodeBlockIndex);
					break;
				}
			}

			//log(source);

			///////////////////////////////////////////////////////////////////////////////////////
			//	Path Variable Setups:
			//  Now, let's set up variables to help us understanding the notes and paths we're
			//  reading from and writing to.
			///////////////////////////////////////////////////////////////////////////////////////

			// Identify the base path of the vault and the active file path.
			//@ts-ignore
			const vaultBasePath = this.app.vault.adapter.basePath;
			log('vaultBasePath: ' + vaultBasePath)
			
			// Get the path from root, no preceding filename.
			const active_note_file_path = this.app.workspace.getActiveFile()?.path;
			
			if (active_note_file_path == null) {
				log("Error! Active File Path is null.");
				return;
			}

			//Get the path from root (no preceding slash, no filename)
			const active_folder_path = active_note_file_path.substring(0, active_note_file_path.lastIndexOf("/"));
			
			// Get the note name without the .md extension. Used later for naming lilypond files. 
			const note_name_no_ext = this.app.workspace.getActiveFile()?.basename;
			
			// Determine the .ly source filename for this codeblock.
			const dotLYSourceFileNameNoExtension = `${lpCodeBlockIndex}_${note_name_no_ext}`;
			const dotLYSourceFileNameWithExtension = `${dotLYSourceFileNameNoExtension}.ly`;
			
			// Without the check on active_path, if we were in the root directory, there'd be a preceding slash that 
			// impacts the call to getAbstractFileByPath.
			const dotLYSourceFilePath = active_folder_path != "" ? 
				`${active_folder_path}/${this.settings.lilyPondFolderName}/${dotLYSourceFileNameWithExtension}` :
				`${this.settings.lilyPondFolderName}/${dotLYSourceFileNameWithExtension}`;
			
				// Set here so it's accessible in the lilypond exec callback.
			const settingsLilyPondFolderName = this.settings.lilyPondFolderName;

			log(`active_note_file_path:\n${active_note_file_path}`); // path + filename
			log(`active_folder_path:\n${active_folder_path}`); // path from root (no preceding slash)
			log(`note_name_no_ext:\n${note_name_no_ext}`); // Just the note name without .md.
			
			///////////////////////////////////////////////////////////////////////////////////////
			//	Cached LilyPond Loading
			//    Since LilyPond takes a bit to compile, when the codeblock first loads in view mode
			//    find the last generated LilyPond output to show while it gets recompiled.
			///////////////////////////////////////////////////////////////////////////////////////

			el.createDiv();

			// This was a little odd to get working, as relative image paths don't work. 
					// Followed a thread here to identify the right url structure:
					// 		https://forum.obsidian.md/t/img-tag-with-relative-file-path/18647/15
					// 		<img src="app://local/absolute/path/to/your/vault/path/to/your/image.jpg" />
					// 		where local is hardcoded.

			const lilyPondImagePreviewFilePath = active_folder_path == "" ? 
			`${settingsLilyPondFolderName}/${dotLYSourceFileNameNoExtension}.preview.png` :
			`${active_folder_path}/${settingsLilyPondFolderName}/${dotLYSourceFileNameNoExtension}.preview.png`;

			const lilyPondAbsolutePreviewURI = `app://local/${app.vault.adapter.basePath}/${lilyPondImagePreviewFilePath}`;

			const lilyPondMidiFilePath = active_folder_path == "" ? 
			`${settingsLilyPondFolderName}/${dotLYSourceFileNameNoExtension}.mid` :
			`${active_folder_path}/${settingsLilyPondFolderName}/${dotLYSourceFileNameNoExtension}.mid`;

			
			// Load the png preview if it exists
			const lilyPondCachedDiv = el.createDiv();
			if (this.app.vault.getAbstractFileByPath(lilyPondImagePreviewFilePath) != null)	
			{	
				const lilyPondCachedImage = lilyPondCachedDiv.createEl("img");
				// Inject a random query string, otherwise the image gets cached by the "browser" and not reloaded from the newly generated file.
				lilyPondCachedImage.src = lilyPondAbsolutePreviewURI + "?ver=" + getRandomInt(999999);
			}
			
			// Load the midi file if it exists. MIDI support is not currently working and will likely require custom JS via WebAudio or WebMIDI to work.
			/*const lilyPondAbsoluteMidiURI = `app://local/${app.vault.adapter.basePath}/${lilyPondMidiFilePath}`
			const lilyPondMidiFile = this.app.vault.getAbstractFileByPath(lilyPondMidiFilePath);

			if (lilyPondMidiFile != null)	
			{	
				const lilyPondCachedMidiAudioEl = lilyPondCachedDiv.createEl("audio");
				// Inject a random query string, otherwise the image gets cached by the "browser" and not reloaded from the newly generated file.
				const lilyPondCachedMidiAudioSrcEl = lilyPondCachedMidiAudioEl.createEl("source");
				lilyPondCachedMidiAudioSrcEl.src = lilyPondAbsoluteMidiURI + "?ver=" + getRandomInt(999999);
				lilyPondCachedMidiAudioSrcEl.type = "audio/midi";
			}*/

			///////////////////////////////////////////////////////////////////////////////////////
			//	Recompiliation check - 
			//	  If the file already exists and there's no changes to the source, 
			//    there's no need to recompile.
			///////////////////////////////////////////////////////////////////////////////////////
			
			const dotLySourceFile = this.app.vault.getAbstractFileByPath(dotLYSourceFilePath);
			if (dotLySourceFile != null)
			{
				//@ts-ignore
				const lyCachedFileContents = await this.app.vault.read(dotLySourceFile); 
				if (lyCachedFileContents.trim() == source.trim())
				{
					log("No changes detect. No need to execute LilyPond. Exiting.")
					return;
				}
			}

			///////////////////////////////////////////////////////////////////////////////////////
			//	Folder and .ly file Creation
			///////////////////////////////////////////////////////////////////////////////////////
			const lilyPondFolder = this.app.vault.getAbstractFileByPath(
				active_folder_path == "" ?
				this.settings.lilyPondFolderName :
				`${active_folder_path}/${this.settings.lilyPondFolderName}`);

			console.log(lilyPondFolder);

			// Create the subfolder for the lilyPond files.
			if (lilyPondFolder == null)
			{
				await this.app.vault.createFolder(`${active_folder_path}/${this.settings.lilyPondFolderName}`);
			}

			const lilyPondSourceFile = this.app.vault.getAbstractFileByPath(dotLYSourceFilePath);
			if (lilyPondSourceFile != null)
			{
				await this.app.vault.delete(lilyPondSourceFile, true);
			}

			await this.app.vault.create(dotLYSourceFilePath, source);

			///////////////////////////////////////////////////////////////////////////////////////
			//	LilyPond Execution
			///////////////////////////////////////////////////////////////////////////////////////
		
			lilyPondCachedDiv.innerText = "Compiling LilyPond...";

			// Execute Lilypond in the appropriate directory.
			// -dno-print-pages will suppress the primary output.
			// -dpreview --png will create a png preview that won't be a full page size.
			// --loglevel will set the loglevel to whatever's in the settings.
			const lilyPondCommand = 'lilypond --png -dno-print-pages -dpreview '
			+ "--loglevel=" + this.settings.lilyPondLogLevel 
			+ ' "' + dotLYSourceFileNameWithExtension + '"';

			log(lilyPondCommand);


			// Build the current working directory for LilyPond, which should be the subfolder specified in settings.
			const lilyPondCurrentWorkingDirectory = active_folder_path == "" ?
				vaultBasePath + "/" + this.settings.lilyPondFolderName :
				vaultBasePath + "/" + active_folder_path + "/" + this.settings.lilyPondFolderName;
				
			//@ts-ignore
			const exec = require('child_process').exec;
			exec(lilyPondCommand, {
				//@ts-ignore
				cwd: lilyPondCurrentWorkingDirectory // assigns the directory to execute lilypond in.
			}, function (error, stdout, stderr) {
				lilyPondCachedDiv.empty();
				const lilyPondDiv = el.createDiv();
				
				// If there was a problem with interpreting the lilypond source, populate the error text in the block.
				if (error != null) {
					lilyPondDiv.innerText = error;
				}
				// Otherwise, show the preview image in the window.
				else {
					
					const lilyPondImage = lilyPondDiv.createEl("img");
					// Inject a random query string, otherwise the image gets cached by the "browser" and not reloaded from the newly generated file.
					lilyPondImage.src = lilyPondAbsolutePreviewURI + "?ver=" + getRandomInt(999999);
					
				}
				log(`error:\n${error}`);
				log(`stdout:\n${stdout}`);
				log(`stderr:\n${stderr}`);

			});

		});

		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LilyPondSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => log('setInterval'), 5 * 60 * 1000));



	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
  }

class LilyPondSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for LilyPond for Obsidian.' });

		new Setting(containerEl)
			.setName('Output File Subfolder Name')
			.setDesc('By default, .ly files and output from LilyPond compilation are stored in a lilyPond subfolder beneath your notes. You can change the name of the directory here.')
			.addText(text => text
				.setPlaceholder('lilyPond')
				.setValue(this.plugin.settings.lilyPondFolderName)
				.onChange(async (value) => {
					log('Secret: ' + value);
					this.plugin.settings.lilyPondFolderName = value;
					await this.plugin.saveSettings();
				}));

				new Setting(containerEl)
				.setName('Log Level')
				.setDesc('Change the Log Level of the LilyPond compiler here [NONE, ERROR, WARN, BASIC_PROGRESS, INFO, DEBUG')
				.addText(text => text
					.setPlaceholder('INFO')
					.setValue(this.plugin.settings.lilyPondLogLevel)
					.onChange(async (value) => {
						log('Secret: ' + value);
						this.plugin.settings.lilyPondLogLevel = value;
						await this.plugin.saveSettings();
					}));
	}
}