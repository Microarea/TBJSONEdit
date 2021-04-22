var view = {
    addView(elem, jsonView, jsonTiles, extensions) {},
    addPanel(elem, jsonPanels, extensions) {},
    addToolbar(elem, jsonPanels, extensions) {},
    render(template, props, flat) {},
    createField(item) {},
    createTile(jsonTile) {}
};
(view => {
    var autoId = 1;

    view.render = function(template, props, flat) {
        for (let [key, value] of Object.entries(props)) {
            template = template.replace(new RegExp(`{${key}}`, "gi"), flat ? value : (value || ""));
        }

        return template;
    }

    function createRow(fields) {
        var row = $(tileRowTemplate);
        fields.forEach(field => {
            row.append(field);
        });
        return row;
    }

    function createBodyEdit(item) {
        var be = $(tileControlBodyeditTemplate);
        var header = $("<div/>", { class: "bodyedit-header" });
        item.items.forEach(col => {
            var col = $("<div/>", { class: "bodyedit-cell size-4", text: col.text });
            header.append(col);
        });
        be.children(".bodyedit").append(header);
        for (r = 0; r < 5; r++) {
            var row = $("<div/>", { style: "display: flex;" });
            item.items.forEach(col => {
                var col = $("<div/>", { class: "bodyedit-cell size-4" });
                row.append(col);
            });
            be.children(".bodyedit").append(row);
        }
        return be;
    }

    view.createField = function(item) {
        var field = $(view.render(tileControlGroupTemplate, {
            "caption": item.text || item.controlCaption,
            "id": item.id
        }));

        if (!item.controlClass) {
            // Prende la controlClass prima disponibile se non è definita va per ordine di ControlClassesTemplates.!
            for (let [key] of Object.entries(ControlClassesTemplates)) {
                if (item.type == ControlClassesTemplates[key].type) {
                    item.controlClass = ControlClassesTemplates[key].controlClass;
                    break;
                }
            }
        }

        // Set captionSize & controlSize if undefined in controllClas
        var controlClass = null; //ControlClassesTemplates[item.controlClass];
        for (let [key] of Object.entries(ControlClassesTemplates)) {
            if (item.controlClass == ControlClassesTemplates[key].controlClass) {
                controlClass = ControlClassesTemplates[key];
                break;
            }
        }

        if (controlClass) {
            if (!item.captionSize && controlClass.captionSize) item.captionSize = controlClass.captionSize;
            if (!item.controlSize && controlClass.controlSize) item.controlSize = controlClass.controlSize;
            if (!item.controlCaption && controlClass.controlCaption) item.controlCaption = " ";
        }

        if (item.type == "Combo" && item.comboType && item.comboType == 2) {
            field.append($(tileControlEnumTemplate));
        } else if (item.type == "Combo" && item.controlClass == "EnumCombo") {
            field.append($(tileControlEnumTemplate));
        } else if (item.type == "Combo" && (!item.comboType || item.comboType != 2)) {
            field.append($(tileControlComboTemplate));
        } else if (item.type == "Check") {
            field.append($(tileControlCheckboxTemplate));
        } else if (item.type == "Edit") {
            if (item.controlClass == "DateEdit") {
                field.append($(tileControlDateTemplate));
            } else {
                field.append($(tileControlEditTemplate));
            }
        } else if (item.type == "Label" && item.controlClass != "LabelStatic") {
            field.append($(view.render(tileControlLabelTemplate, { "placeholder": item.placeholder })));
        } else if (item.type == "Label" && item.controlClass == "LabelStatic") {
            field = $(view.render(tileControlLabelStaticTemplate, { "caption": item.text, "id": item.id }));
        } else if (item.type == "BodyEdit") {
            field.append(createBodyEdit(item));
        } else if (item.type == "Button") {
            field.append($(tileControlButtonTemplate));
        } else if (item.type == "Radio") {
            field.append($(tileControlRadioTemplate));
        } else if (item.type == "ToolbarButton") {
            field.append($(toolbarButtonTemplate));
        } else {
            console.log("Manca.:", item.type);
        }

        if (field.children(".tile-control")) {
            field.children(".tile-control").addClass(item.controlSize ? ("size-" + item.controlSize) : "size-100");
        }
        if (item.captionSize > 0 && (item.text || item.controlCaption)) {
            field.children(".tile-control-caption").addClass("size-" + item.captionSize);
        } else {
            field.children(".tile-control-caption").hide();
        }
        var lines = Math.floor(item.height / 12);
        if (lines > 1) {
            field.find(".single-line").addClass("multi-line-" + lines);
            field.find(".single-line").removeClass(".single-line");
            field.children(".tile-control-caption").addClass("multi-line-caption");
        }
        return field;
    }

    function fieldWidth(item) {
        var w = item.controlSize ? item.controlSize : 0;
        if (item.captionSize > 0 && (item.text || item.controlCaption)) {
            w += item.captionSize;
        }
        return w;
    }

    function createNewsletterColumn(jsonTile) {
        if (!jsonTile.items) return;
        var col = $(tileColumnTemplate);
        jsonTile.items.forEach(item => {
            // if (item.activation) return;
            if (!item.anchor.startsWith("COL")) return;
            var fields = [view.createField(item)];
            jsonTile.items.filter(i => i.anchor == item.id).forEach(anchored => {
                fields.push(view.createField(anchored));
            });
            col.append(createRow(fields));
        });
        if (col.children().length > 0) {
            return col;
        }
    }

    function createColumn(anchor, block, jsonTile) {
        if (!jsonTile.items) return;
        var col = $(tileColumnTemplate);
        var colWidth = 0;
        jsonTile.items.filter(i => i.anchor == anchor && i.block == block).forEach(item => {
            // if (item.activation) return;
            var fields = [view.createField(item)];
            var rowWidth = fieldWidth(item);
            jsonTile.items.filter(i => i.anchor == item.id).forEach(anchored => {
                fields.push(view.createField(anchored));
                rowWidth += fieldWidth(anchored);
            });
            if (rowWidth > colWidth) {
                colWidth = rowWidth;
            }
            col.append(createRow(fields));
        });
        if (col.children().length > 0) {
            if (jsonTile.variableBlockWidth) {
                col.addClass("flex-" + colWidth);
            }
            return col;
        }
    }

    function extendTile(jsonTile, extensions) {
        if (!jsonTile || !extensions) return jsonTile;

        var extension = extensions.find(ext => ext.extends == jsonTile.id);

        if (!extension) return jsonTile;

        if (jsonTile.items && extension.items) {
            jsonTile.items.forEach(item => {
                var itemExt = extension.items.find(i => i.id == item.id);
                if (itemExt) {
                    $.extend(item, itemExt);
                }
            });
            delete extension.items;
        }

        return $.extend(jsonTile, extension);
    }

    view.createTile = function(jsonTile) {
        if (!jsonTile) return;

        var tile = $(view.render(tileTemplate, {
            "title": jsonTile.text,
            "id": jsonTile.id
        }));

        if (!jsonTile.text || jsonTile.text == "") {
            tile.children(".tile-title").hide();
        }

        if (jsonTile.newsletterColumns) {
            var col = createNewsletterColumn(jsonTile);
            if (col) {
                col.addClass("newsletter");
                col.css("--rows-2-col", Math.ceil(col.children().length / 2));
                col.css("--rows-3-col", Math.ceil(col.children().length / 3));
                col.css("--rows-4-col", Math.ceil(col.children().length / 4));
                tile.children(".tile-content").append(col);
            }
        } else {
            tile.children(".tile-content").addClass("column");

            //sanitize invalid anchors
            if (jsonTile.items) {
                jsonTile.items.forEach(itm => {
                    if (!itm.anchor || (!itm.anchor.startsWith("COL") && !jsonTile.items.find(i => i.id == itm.anchor))) {
                        itm.anchor = "";
                    }
                });
            }

            var blockOrder = 1;
            for (c = 1; c <= 2; c++) {
                // var col = $(tileColumnTemplate);
                for (b = 1; b <= 2; b++) {
                    var block = createColumn("COL" + c, "BLK" + b, jsonTile);
                    if (!block)
                        break;
                    // col.append(block);
                    block.addClass("order-" + blockOrder++);
                    tile.children(".tile-content").append(block);
                }
                var col = createColumn("COL" + c, null, jsonTile);
                if (col) {
                    tile.children(".tile-content").append(col);
                }
            }
            noAnchor = createColumn("", null, jsonTile);
            if (noAnchor) {
                tile.children(".tile-content").append(noAnchor);
            }
        }

        if (jsonTile.size && jsonTile.size == "AutoFill") {
            tile.addClass("tile-autofill");
        }

        return tile;
    }

    function createLayoutContainer(item, jsonTiles, extensions) {
        if (!item.id && item.items) {
            item.id = `LC_${autoId++}`;
        }
        var lc = $(view.render(layoutContainerTemplate, { "id": item.id || null }));
        if (item.items) {
            item.items.forEach(itm => {
                if (itm.href) {
                    lc.append(view.createTile(extendTile(jsonTiles.find(tile => tile.id == itm.href), extensions)));
                } else {
                    lc.append(createLayoutContainer(itm, jsonTiles, extensions));
                }
            });
        } else {
            lc.append(view.createTile(extendTile(jsonTiles.find(tile => tile.id == item.href), extensions)));
        }
        return lc;
    }

    function createTilegroup(item, jsonTiles, extensions) {
        item.id = item.id || (item.items ? `TG_${autoId++}` : null);
        var tg = $(view.render(tileGroupTemplate, { "id": item.id }));
        item.items.forEach(item => {
            tg.append(createLayoutContainer(item, jsonTiles, extensions));
        });
        return tg;
    }

    view.addToolbar = function(elem, jsonToolbar, extensions) {
        elem[0].innerHTML = "";
        var lc = "";
        lc = $(view.render(toolbarContainerTemplate, { "id": jsonToolbar.id }));
        jsonToolbar.items.forEach(item => {
            if (item.type == "ToolbarButton") {
                var bt = $(view.render(toolbarButtonTemplate, { "id": item.id }));
                lc.append(bt);
            }
        });
        elem.append(lc);
    }

    function isToolbar(jsonElements) {
        if (jsonElements.type == "Toolbar") {
            view.addToolbar($("#toolbar-content"), jsonElements);
            return true;
        }

        if (!jsonElements.items)
            return false;

        var bFound = false;
        jsonElements.items.forEach(jsonElement => {
            if (jsonElement.type == "Toolbar") {
                view.addToolbar($("#toolbar-content"), jsonElement);
                bFound = true;
            }
        });
        return bFound;
    }

    view.addPanel = function(elem, jsonPanels, extensions) {
        elem[0].innerHTML = "";
        var lc = $(view.render(layoutContainerTemplate, { "id": "layout-container" }));
        jsonPanels.forEach(jsonPanel => {
            if (isToolbar(jsonPanel))
                return;
            var panel = view.createTile(jsonPanel);
            lc.append(panel);
        });
        elem.append(lc);
    }

    view.addView = function(elem, jsonView, jsonTiles, extensions) {
        var mainView = $(view.render(viewTemplate, { "id": jsonView.id }));
        jsonView.items.forEach(item => {
            if (isToolbar(item))
                return;
            mainView.append(createTilegroup(item, jsonTiles, extensions));
        });
        elem[0].innerHTML = "";
        elem.append(mainView);
    }

})(view);