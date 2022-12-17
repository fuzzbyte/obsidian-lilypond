# LilyPond for Obsidian

This plugin will display LilyPond engraving output from a lilypond codeblock in Obsidian. Here's a demo:

![LilyPondForObsidian](https://user-images.githubusercontent.com/8451031/208253223-5daeffca-3bae-4a37-9f0c-f751060aee43.gif)

## Features

- Write LilyPond code inside of Obsidian, and see it live-render for you.
- Configurable LilyPond Log Levels - LilyPond's errors not making any sense? Up to DEBUG mode!
- .ly File Access - simply look in the lilyPond subdirectories to find the generated previews and .ly files for your use outside Obsidian. 
- Easy MIDI file links that open in your default midi player, if you generate MIDI output with your score (don't forget to include the layout block too, or your score won't render!)

![image](https://user-images.githubusercontent.com/8451031/206927705-4ec6829e-2941-480d-9481-b6a6f85bae48.png)



## Pair with the templates plugin for more power!

### Step 1: Create a template
![image](https://user-images.githubusercontent.com/8451031/208253296-07084912-1258-4613-9522-0d4ba91f072a.png)
### Step 2: Use the "Template: Insert Template" command to use the template in another file, and edit from there!
![image](https://user-images.githubusercontent.com/8451031/206926636-fc728a5b-51a2-48da-8f96-215fcb7c484c.png)
![image](https://user-images.githubusercontent.com/8451031/206926642-0d165221-eaf8-4772-8981-b4429854d391.png)
![image](https://user-images.githubusercontent.com/8451031/206926685-93c42667-c47e-4ce7-a292-b77c66ce12dc.png)



## Setup

- Ensure You have LilyPond installed on your computer, and lilypond is on the PATH variable. 
  - Confirm this by opening a terminal on your computer and typing lilypond --version.

## Usage

- Create a LilyPond Codeblock using ```lilypond in edit mode.
- Ensure each LilyPond Codeblock has a first line with a LilyPond comment indicating a .ly filename, like 

```
% MyScore.ly
{ c' e' g' }
```

- In LivePreview mode, exit the codeblock, and the plugin will compile your LilyPond and display an image of the output.
- Switching to Reading Mode will also display the output.

## How it works

- This plugin relies on your local lilypond instance. As you write a Lilypond block, this plugin saves the results to a .ly file and sends it to Lilypond for compliation. The output uses the "preview" .png file of Lilypond to render it in Obsidian. 
- Lilypond files are saved as {NoteName}_{BlockName}.ly under the lilypond folder (_lilypond by default) with a directory structure built out to match your notes.

## Cautions

- There is no support for Obsidian Mobile, as lilypond compilation would be pretty tricky on mobile.
- I don't have Obsidian Publish, so I have no idea if it would work there or not.
- Extraneous files are sometimes left un-cleaned up (for example, if you change the filename of a block, or if your generated scores or MIDI files are open in another program). This plugin will not clean all files up automatically, however, it does clean up some lilypond temp files periodically in your vault. You can safely delete the lilypond directory - your lilypond scores are still safe in your markdown files, and the next time you open one of those files, output should regenerate.
- Moving files around within folders is fine, as they should regenerate the next time you open a note - but it will not remove previously generated scores.



