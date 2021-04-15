# JSON Editor
A simple editor helping the creation and maintenance of `.tbjson` UI definition.

*Note*: it supports **codeless applications** only, so that `.hjson` and other source files are not created nor maintained.

## Prerequisites
To use this editor you need [Node.js](https://nodejs.org/en/) 8.9 or higher.  

## Original project
https://github.com/andrea-rinaldi-microarea/JSONEdit

## Installation
Clone the repository:
```
git clone https://github.com/Microarea/TBJSONEdit.git
```
move in the folder and install dependencies
```
npm install
```
Create a symbolic link to the editor:
```
npm link
```

*Note on npm link*: for the command to be correctly generated, the starting source (i.e.: `main.js`) **MUST** start with `#!/usr/bin/env node`) 

## Usage
From a command prompt, launch:
```
tbje
-- or --
tbjson-edit
```

## Paramiter
```
-e [open in editing all tbjson in folder>]
-f <file.tbjson> [open single file to editing]
```
The application starts and the default browser is opened.   
In the first page set a folder containing a group of `.tbjson` files forming a UI. The current folder is prompted as default.

*Note*: due to browser security limitation, browsing to a folder is not allowed, the folder name must be cut-and-pasted from a File Explorer.

# UI Elements
All UI Elements share some common properties
``` JSON5
{
    "id": "..." // unique id of the UI element 
}
```
## Controls
Controls are UI elements with one of the following `type`:
* `Edit`
* `Check`
* `Combo`
* `Label`
* `Button`
* `Radio`
* `List`
* `BodyEdit`
* `EmailAddressEdit`
* `PercentEdit`


They share some common properties:
``` JSON5
{
    "type": "<...>", // one of the above
    "controlClass": "<...>",
    "anchor": "<...>", // COL1, COL2 or another control
    "captionSize": <nn>,
    "controlSize": <nn>,
    "binding": {
        ...
    },
    "tabStop": true
}
```
The `controlClass` property set the control behavior, while the `binding` property connect the control to the data model.
### Control Classes
#### `StringEdit`
``` JSON5
{
    "type": "Edit",
    "controlClass": "StringEdit",
    "controlCaption": "<...>",
}
```
Basic control to enter a string.

There are a number of derived `StringEdit` classes, such as `AddressEdit`, etc.
#### `StringStatic`
``` JSON5
{
    "type": "Label",
    "controlClass": "StringStatic",
    "controlCaption": "<...>",
}
```
Shows a non-modifiable string, such as the description of an HotLink.
#### `CheckBox`
``` JSON5
{
    "type": "Check",
    "controlClass": "CheckBox",
    "text": "<...>",
    "labelOnLeft": true,
    "textAlign": "Right", // or Left
}
```
A checkbox, the label can be on left or right, and the label text right or left aligned.
#### `StringComboDropDown`
``` JSON5
{
    "type" : "Combo",
    "controlClass" : "StringComboDropDown",
    "controlCaption": "<...>",
    "binding" : {
        ...
        "hotLink" : {
            "name" : "<...>",
            "namespace" : "<...>"
        }
    },
}
```
A combobox normally used to pick data from another table, so that the binding will include an Hotlink.
#### `LabelStatic`
``` JSON5
{
    "type": "Label",
    "controlClass": "LabelStatic",
    "text": "<...>",
}
```
A label used to create a separation inside a tile. It has normally no `bindings`.
#### `EnumCombo`
``` JSON5
{
    "type": "Combo",
    "controlClass": "EnumCombo",
    "controlCaption": "<...>",
}
```
A dropdown used to select a value out of an enum. The enum to pick from is inferred from the field which is bound to the control.
#### `DateEdit`
``` JSON5
{
    "type": "Edit",
    "controlClass": "DateEdit",
    "controlCaption": "<...>",
}
```
A control used to input a date, with an attached widget to choose the date from a calendar.
#### `Button`
``` JSON5
{
    "type": "Button",
    "controlClass": "Button",
    "controlCaption": "<...>",
}
```
A button represents an action the user can fire by clicking it.
# TB JSON tags
## type
The `type` tag indicates the general type of the UI element

*Note: numeric values are deprecated*
## Frame and toolbars
* Frame
* ToolbarButton (15)
* Toolbar (14)
* DockingPane

## Views and layout
* View (1)
* TileGroup (72)
* LayoutContainer (78)
* Tile (71)
* TileManager (76)
* TilePanel (77)
* Panel

## Controls
* Edit
* Check
* Combo
* Label
* Button
* Radio
* List
* BodyEdit

## misc
* Constants (69)
* RowView??? (66)
* HeaderStrip (79)
* FilterGroup (88)
* MenuItem
* ColTitle
* ??? (3)
* PropertyGrid
* PropertyGridItem
* WizardStep (90)
* WizardManager (89)
