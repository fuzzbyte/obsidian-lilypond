# LilyPond for Obsidian

This plugin will display LilyPond engraving output from a lilypond codeblock in Obsidian:


## Features

- Write LilyPond code inside of Obsidian, and see it live-render for you.
- Smart recompilation - LilyPond output is only recompiled when you changed the codeblock.
- Configurable LilyPond Log Levels - LilyPond's errors not making any sense? Up to DEBUG mode!
- .ly File Access - simply look in the lilyPond subdirectories to find the generated previews and .ly files for your use outside Obsidian.

## Setup

- Ensure You have LilyPond installed on your computer, and lilypond is on the path variable. 
  - Confirm this by opening a terminal on your computer and typing lilypond --version.

TODO: Add instructions to add to PATH.

## Usage

- Create a LilyPond Codeblock using ```lilypond in edit mode.
- In LivePreview mode, exit the codeblock, and the plugin will compile your LilyPond and display an image of the output.
- Switching to Reading Mode will also display the output.

## Cautions

- Do not rename the lilypond folder to a hidden folder (i.e. .lilyPond). This will not work, as Obsidian can't see it, and I can't check to see if those files/folders already exist during the creation/updating of lilypond output.
- There is no support for Obsidian Mobile, as lilypond compilation would be pretty tricky on mobile.


