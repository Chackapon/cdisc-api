# CDisc API [Bedrock Addon]

![Minecraft Version](https://img.shields.io/badge/Minecraft_Bedrock-1.26.40-brightgreen)

Library addon that allows easy addition of custom music discs that behave (almost) exactly like vanilla!

<span style="color:#E03E2D;">**THIS ADDON IS ACHIEVEMENT FRIENDLY!**</span>

## Preface

I've got no idea how it's been over 2 years since custom music discs have been added to the Java Edition and they're still not here on bedrock. I love having a lot of discs in the game as collectibles (I always install a few of big disc packs on java) and I became frustrated with how fragmented all of the existing disc packs are.

Furthermore, while searching for an addon that would allow me to easily add custom discs, I found that almost all of them require you to do custom scripting, custom jukeboxes, etc. And the better looking addons just don't have any disc packs using them.

What I wanted is to just was to achieve the closest to vanilla experience possible, while also making it easy to add your custom discs.

## Features

The features of this addon can be separated into two categories - vanilla/compatibility and some new ones.

### Vanilla

1. To play the disc you have to interact with it with a jukebox
2. Note particles are displayed over the jukeboxes that are currently playing a disc
3. All of the jukeboxes are tracked and their contents are remembered. If you leave the world or break the jukebox, the disc won't be lost
4. The behavior of playing the same disc in different jukeboxes is exactly like vanilla as far as I'm concerned

### Modded features

1. Discs can have 2 sides - just like the real LPs! Actually, while at it, I made it so you can add as many sides as you want. While not as realistic, this allows for adding whole albums with track selection. To change the side, you have to use the item not on a jukebox (right-click/long-hold).
2. [WIP] Custom jukeboxes can be added which inherit all of the functionality of the CDisc API (won't accept vanilla discs currently and has to be added manually in the script files)

## Usage

CDisc name comes from "Component Disc", as this library uses a custom item component to turn an item into a music disc. This allows you to give any arbitrary item music disc functionality - simple item, weapon, food, armor, etc. In this regard this library functions just like any other vanilla component wood.

### Simple music disc

To turn an item into a music disc you have to add **"cdisc:record"** into the "components" section of "minecraft:item".

Here's an example component definition:
```json
{
  "minecraft:item": {
    "components": {
      "cdisc:record": {
        "sound": "record.somesong",
        "title": "Song Title",
        "author": "Artist",
        "duration": 67
      }
    }
  }
}
```
Here's what each field means:
* **sound** - The identifier of the sound to be played, either a vanilla sound or custom one's defined in the resource packs' ```sound_definitions.json```
* **title** - The name of the song
* **author** - The artist of the song
* **duration** - how long the song lasts in seconds. This is used to control when note particles should be displayed and the behavior of same discs being played in different jukeboxes

**title** and **author** fields are used for the "Now Playing" action bar. They are also optional - if no value provided, they'll be listed as "Unknown" and "Untitled" respectively.

### Multi Disc

The way you add a disc with multiple sides/songs is very similar:
```json
{
  "minecraft:item": {
    "components": {
      "cdisc:record": {
        "songs": [ "side_a", "part_2" ],
        "side_a": {
          "sound": "record.someaudio1",
          "title": "Album [Side A]",
          "author": "Some Artist",
          "duration": 258
        },
        "part_2": {
          "sound": "record.someaudio2",
          "title": "Album [Side B]",
          "author": "Can be same or other artist",
          "duration": 987
        }
      }
    }
  }
}
```

### Misc

When making an addon don't forget to add the following to the **dependencies** of your behavior pack's ```manifest.json```:
```json
{
  "dependencies": [
    {
      "uuid": "c4c3b4b2-7514-43c8-b3ce-668588dbac60",
      "version": [ 1, 0, 0 ]
    }
  ]
}
```
This way Minecraft will warn the user if CDisc API is not present and also autoselect it if they only turn on your CDisc Addon Disc Pack.

The key difference is that the top level objects now are **"songs"** followed by the song definitions as their own entries (which are exactly the same as for single disc.

Inside **"songs"** you define the identifiers of the song entries. Their name doens't affect anything aside from the order in which the sides are advanced. In this example, the default song when you get the item is the one defined as **"side_a"**, and if you change it's side it switches to **"part_2"**. After reaching the last entry the disc will return to it's first state.

The **title** and **author** fields for each entry can be anything, this example uses the "[Side N]" formula only as a demonstration.

## Planned features

* Optional addon that moves the vanilla discs to the CDisc API
* Album covers
* An app/script to generate CDisc compatible addons
* Optional auto ejection to hoppers, maybe auto insertion as well
* Gamerule for disc to be consumed on insertion in creative mode
* Settings menu
* Make custom jukeboxes tag/component driven

## Known bugs

* Floating music disc notes are black
* No rainbow effect on the "Now playing" tooltip
* When exchanging a vanilla disc with cdisc one (and vice-versa) the ejection and insertion happen at the same time
* No item lore when item is crafted/taken from creative (you have to add the custom lore to the recipe itself)

If you notice any other bugs, please let me know of them on the [GitHub Issues](https://github.com/Chackapon/tree_nests/issues) page!
