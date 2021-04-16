var JSONEdit = {
    save() {},
    apply() {},
    addControl() {},
    controlUp() {},
    controlDown() {},
    removeTile() {},
    removeControl() {},
    bodyeditAddColum() {},
    containerUp() {},
    containerDown() {},
    removeContainer() {},
    tilePush() {},
    tilePop() {}
};


(JSONEdit => {

    function treeItemId(id) {
        return `TI-${id}`;
    }

    function addTileActions() {
        $("#uiElementActions")[0].innerHTML = "";
        $("#uiElementActions").append($("#tile-actions").html());
        for (let [key] of Object.entries(ControlClassesTemplates)) {
            $('#controlClasses').append($('<option/>', {
                value: key,
                text: key
            }));
        }
    }

    function addPanelActions() {
        $("#uiElementActions")[0].innerHTML = "";
        $("#uiElementActions").append($("#tile-actions").html());
        for (let [key] of Object.entries(ControlClassesTemplates)) {
            $('#controlClasses').append($('<option/>', {
                value: key,
                text: key
            }));
        }
    }

    function addControlActions(bodyEdit = false) {
        $("#uiElementActions")[0].innerHTML = "";
        if (bodyEdit) {
            $("#uiElementActions").append($("#bodyedit-actions").html());
            for (let [key] of Object.entries(BodyEditColumTemplates)) {
                $('#bodyEditColumControlClasses').append($('<option/>', {
                    value: key,
                    text: key
                }));
            }
        }
        $("#uiElementActions").append($("#control-actions").html());
    }

    function addLayoutContainerActions() {
        $("#uiElementActions")[0].innerHTML = "";
        $("#uiElementActions").append($("#layout-container-actions").html());
    }

    function addTileGroupActions() {
        $("#uiElementActions")[0].innerHTML = "";
        $("#uiElementActions").append($("#tile-group-actions").html());
    }

    function onUIElementSelected(event, uiTarget) {
        event.stopPropagation();
        var target = uiTarget ? $(uiTarget) : $(event.currentTarget);
        $(".selected-ui-element").removeClass("selected-ui-element");
        target.addClass("selected-ui-element");
        $(".selected-tree-element").removeClass("selected-tree-element");
        $(`#${treeItemId(target[0].id)}`).addClass("selected-tree-element");
    }

    function findFileNAme(ui, inItems, fn) {
        if (!inItems)
            return;
        inItems.forEach(item => {
            if (item.id == ui.obj.id) {
                $("#uiElementFname")[0].innerHTML = fn;
            }
        });
        if (!inItems.items) {
            rt = findFileNAme(ui, inItems.items, fn);
        }
    }

    function showUIObjectProperties(element, ui, hide, readonly, managed, parent) {
        if (!ui.obj) return;
        if (!parent) {
            $("#uiElementType")[0].innerHTML = ui.type;
            $("#uiElementFname")[0].innerHTML = "";
            if (ui.obj.fname) {
                $("#uiElementFname")[0].innerHTML = ui.obj.fname;
            } else {
                tiles.forEach(tile => {
                    findFileNAme(ui, tile.items, tile.fname);
                });
            }
            $("#uiElementProperties")[0].innerHTML = "";
        }

        for (let [key, value] of Object.entries(ui.obj)) {
            if (hide && hide.includes(key)) continue;
            var template = $("#property-template");
            if (typeof value === "boolean") {
                template = $("#property-template-checkbox");
            } else if (typeof value === "number") {
                template = $("#property-template-number");
            } else if (typeof value === "object") {
                template = $("#property-template-object");
            }
            var ns = parent ? `${parent}.${key}` : key;
            var field = $(view.render(template.html(), {
                "id": ns,
                "name": key,
                "value": value
            }, true));
            if (typeof value === "object") {
                showUIObjectProperties(field, { obj: value }, hide, readonly, managed, ns);
                field.find(".property-row").addClass("ml-1");
                field.find(".property-group").addClass("ml-1");
            }
            if (readonly && readonly.includes(key)) {
                field.find(`#${key}`).prop('disabled', true);
            }
            if (managed && managed.includes(key)) {
                field.find(".property-name").addClass("property-managed");
            }
            // render does not set the value for booleans, must be forced via property
            if (typeof value === "boolean" && value) {
                field.find(`#${key}`).prop('checked', true);
            }
            element.append(field[0]);
        }
    }

    function showControlProperties(bodyEdit = false) {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["auxKeys"], ["type", "controlClass"], ["text", "controlCaption", "id", "type", "comboType", "controlClass", "placeholder", "controlSize", "captionSize", "height", "anchor"]);
        addControlActions(bodyEdit);
    }

    var urlParams = new URLSearchParams(window.location.search);
    var folderName = urlParams.get("folderName");
    var fileName = urlParams.get("filename");
    var tiles = [];
    var selectedUIObject = null;
    var mainView = null;
    var mainPanels = null;

    function explodeContainer(item) {
        var node = {};
        if (item.items) {
            node.label = `${item.id || ""} (${item.type})`;
            node.id = treeItemId(item.id);
            node.childrens = [];
            item.items.forEach(itm => {
                if (itm.href) {
                    var tile = tiles.find(t => t.id == itm.href);
                    node.childrens.push({ label: tile.name, id: treeItemId(tile.id) });
                } else {
                    node.childrens.push(explodeContainer(itm));
                }
            });
        } else {
            var tile = tiles.find(t => t.id == item.href);
            node.label = tile.name;
            node.id = treeItemId(item.id);
        }
        return node;
    }

    function explodeContainerPanel(item) {
        var node = {};
        if (item.items) {
            node.label = `${item.id || ""} (${item.type})`;
            node.id = treeItemId(item.id);
            node.childrens = [];
            item.items.forEach(itm => {
                if (itm.href) {
                    var tile = tiles.find(t => t.id == itm.href);
                    if (tile)
                        node.childrens.push({ label: tile.name, id: treeItemId(tile.id) });
                } else {
                    node.childrens.push(explodeContainerPanel(itm));
                }
            });
        } else {
            var tile = tiles.find(t => t.id == item.href);
            if (tile) {
                node.label = tile.id;
                node.id = treeItemId(item.id);
            }
        }
        return node;
    }

    function traverseItems(items, apply) {
        if (!items) return;
        items.forEach(itm => {
            apply(itm);
            traverseItems(itm.items, apply);
        })
    }

    function findItem(items, match) {
        if (!items) return null;
        var item = null;
        items.find(itm => {
            item = itm;
            if (match(itm)) return true;
            item = findItem(itm.items, match);
            if (item) return true;
        });
        return item;
    }

    function onTreeItemClicked(event) {
        var uiObjId = event.currentTarget.id.replace("TI-", "");
        onUIElementSelected(event, $(`#${uiObjId}`));
        var uiObj = findItem(tiles, tile => {
            return tile.id && tile.id == uiObjId
        });
        selectedUIObject = { type: uiObj.type, obj: uiObj };
        switch (uiObj.type) {
            case "Tile":
                showTileProperties();
                break;
            case "Panel":
                showPanelProperties();
                break;
            case "View":
                showViewProperties();
                break;
            case "LayoutContainer":
                showLayoutContainerProperties();
                break;
            case "TileGroup":
                showTileGroupProperties();
                break;
            default:
                showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items"]);
        }
    }

    function showViewContainerTree() {
        var viewContainers = [];

        if (mainView) {
            viewContainers.push(explodeContainer(mainView));
        } else {
            mainPanels.forEach(mainPanel => {
                viewContainers.push(explodeContainerPanel(mainPanel));
            });
        }

        $("#view-container-tree")[0].innerHTML = "";
        $("#view-container-tree").flexTree({
            name: 'viewContainerTree',
            collapsed: false,
            collapsable: false,
            items: viewContainers
        });

        $("#view-container-tree li label.node").click(onTreeItemClicked);
        $("#view-container-tree li label.leaf").click(onTreeItemClicked);
    }

    function onUIElementClicked(event) {
        onUIElementSelected(event);
        var uiObjId = $(event.currentTarget)[0].id;
        var uiObj = findItem(tiles, tile => {
            return tile.id && tile.id == uiObjId
        });
        selectedUIObject = { type: uiObj.type, obj: uiObj };
        switch (uiObj.type) {
            case "Tile":
                showTileProperties();
                break;
            case "Panel":
                showPanelProperties();
                break;
            case "View":
                showViewProperties();
                break;
            case "LayoutContainer":
                showLayoutContainerProperties();
                break;
            case "TileGroup":
                showTileGroupProperties();
                break;
            default:
                showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items"]);
        }
    }

    function showViewProperties() {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items", "fname"], ["type"], []);
    }

    function showTileProperties() {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items", "fname"], ["type", "id"], ["text", "id", "size"]);
        addTileActions();
    }

    function showPanelProperties() {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items", "fname"], ["type", "id"], ["text", "id", "size"]);
        addPanelActions();
    }

    function showLayoutContainerProperties() {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items"]);
        addLayoutContainerActions();
    }

    function showTileGroupProperties() {
        showUIObjectProperties($("#uiElementProperties"), selectedUIObject, ["items"]);
        addTileGroupActions();
    }

    function onControlClicked(event) {
        onUIElementSelected(event);
        var ctrlId = $(event.currentTarget)[0].id;
        var ctrl = findItem(tiles, c => {
            return c.id && c.id == ctrlId
        });
        selectedUIObject = { type: "Control", obj: ctrl };
        showControlProperties(ctrl.controlClass == 'BodyEdit');
    }

    function showView() {
        if (mainView) {
            view.addView($("#main-content"), mainView, tiles);
        } else {
            view.addPanel($("#main-content"), mainPanels);
        }

        showViewContainerTree();

        $(".main-view").click(onUIElementClicked);
        $(".tile").click(onUIElementClicked);
        $(".tile-control-group").click(onControlClicked);

        if (selectedUIObject) {
            $(`#${selectedUIObject.obj.id}`).addClass("selected-ui-element");
        }
    }

    function uiObjectType(type) {
        switch (type) {
            case 1:
                return "View";
            case 2:
                return "Label";
            case 3:
                return "Button";
            case 8:
                return "Image";
            case 9:
                return "Group";
            case 10:
                return "Radio";
            case 11:
                return "Check";
            case 12:
                return "Combo";
            case 13:
                return "Edit";
            case 66:
                return "Panel";
            case 71:
                return "Tile";
            case 72:
                return "TileGroup";
            case 78:
                return "LayoutContainer";
            case 76:
                return "TileManager";
            case 77:
                return "TilePanel";
        }
        return type;
    }

    $.get(
        "/openFolder", { folderName: folderName },
        function(data) {
            data.forEach(form => {
                var tile = JSON.parse(form.content);
                tile.fname = form.fname;

                if (fileName) {
                    if (fileName == tile.fname) {
                        tiles.push(tile);
                    }
                } else {
                    // all file in directory
                    tiles.push(tile);
                }
            });

            var idDictionary = {}
            traverseItems(tiles, itm => {
                if (itm.type) {
                    itm.type = uiObjectType(itm.type);
                }
                if (itm.id) {
                    idDictionary[itm.id] = true;
                }
            });

            // find the ID of the main view
            var mainFrame = tiles.find(tile => {
                if (
                    tile.href &&
                    tile.href == "M.Framework.TbGes.TbGes.IDD_MASTER_FRAME" &&
                    tile.items[0].href
                ) {
                    return true;
                }
            });

            // Not view and Tile group
            if (!mainFrame) {
                mainPanels = tiles;
                showView();
                return;
            }

            // find the main view
            mainView = findItem(tiles, tile => {
                return tile.id && tile.id == mainFrame.items[0].href
            });

            if (mainView) {
                showView();
            }

        }
    ).fail(
        function(error) {
            $("#message")[0].innerHTML = error.responseText;
        }
    );

    JSONEdit.save = function(event) {
        if (!confirm("Save changes ?")) return;
        event.stopPropagation();
        var body = {
            folderName: folderName,
            fileName: fileName,
            forms: []
        };
        tiles.forEach(tile => {
            var sTile = _.merge({}, tile);
            var fname = sTile.fname || `${sTile.id}.tbjson`;
            delete sTile.fname;
            body.forms.push({ fname: fname, content: JSON.stringify(sTile, null, 4) });
        });

        $.post('/save', body)
            .fail(
                function(error) {
                    $("#message")[0].innerHTML = error.responseText;
                });
    }

    JSONEdit.apply = function() {
        if (!selectedUIObject) return;

        $("#uiElementProperties input").each(function(index) {
            if (this.type == "checkbox") {
                _.set(selectedUIObject.obj, this.id, this.checked);
            } else if (this.type == "number") {
                _.set(selectedUIObject.obj, this.id, this.valueAsNumber);
            } else {
                _.set(selectedUIObject.obj, this.id, this.value);
            }
        });

        showView();
    }

    JSONEdit.addControl = function(event) {
        event.stopPropagation();
        var controlClass = ControlClassesTemplates[$('#controlClasses').val()];
        if (!controlClass || !selectedUIObject) return;

        // Tile
        if (selectedUIObject.type == "Tile") {
            var tile = selectedUIObject.obj;
            if (!Array.isArray(controlClass))
                controlClass = [controlClass];
            var firstPos = tile.items.length;
            controlClass.forEach(cc => {
                var ctrl = _.merge({}, cc);
                if (selectedUIObject.obj.name) {
                    ctrl.id = `IDC_${selectedUIObject.obj.name.toUpperCase()}_CTRL${tile.items.length}`;
                } else {
                    ctrl.id = `${selectedUIObject.obj.id}_CTRL${tile.items.length}`;
                }

                if (ctrl.anchor == "") ctrl.anchor = `IDC_${selectedUIObject.obj.name.toUpperCase()}_CTRL${firstPos}`;
                tile.items.push(ctrl);
            });
            selectedUIObject = { type: "Control", obj: tile.items[firstPos] };
        }
        // Panel
        if (selectedUIObject.type == "Panel") {
            var panel = selectedUIObject.obj;
            if (!Array.isArray(controlClass))
                controlClass = [controlClass];
            var firstPos = panel.items.length;
            controlClass.forEach(cc => {
                var ctrl = _.merge({}, cc);
                ctrl.id = `${selectedUIObject.obj.id}_CTRL${panel.items.length}`;
                if (ctrl.anchor) ctrl.anchor = "";
                panel.items.push(ctrl);
            });
            selectedUIObject = { type: "Control", obj: panel.items[firstPos] };
        }

        showView();

        showControlProperties(selectedUIObject.obj.controlClass == 'BodyEdit');
    }

    JSONEdit.removeControl = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "Control") return;
        if (!confirm("Remove the selected control?")) return;

        var tile = tiles.find(t => { return t.items && t.items.find(i => { return i.id && i.id == selectedUIObject.obj.id }) });
        if (!tile) return;
        var idx = tile.items.findIndex(itm => { return itm.id == selectedUIObject.obj.id; });
        if (idx == -1) return;
        tile.items.splice(idx, 1);

        selectedUIObject = { type: tile.type, obj: tile };

        showView();

        showTileProperties();
    }


    JSONEdit.bodyeditAddColum = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "Control") return;
        var BEcontrolClass = BodyEditColumTemplates[$('#bodyEditColumControlClasses').val()];

        selectedUIObject.obj.items.push(BEcontrolClass);

        showView();

        showControlProperties(true);
    }

    function controlMove(displacement) {
        if (!selectedUIObject || selectedUIObject.type != "Control") return;

        var tile = tiles.find(t => { return t.items && t.items.find(i => { return i.id && i.id == selectedUIObject.obj.id }) });
        if (!tile) return;
        var idx = tile.items.findIndex(itm => { return itm.id == selectedUIObject.obj.id; });
        if (idx == -1 || idx + displacement < 0 || idx + displacement >= tile.items.length) return;
        tile.items.splice(idx + displacement, 0, tile.items.splice(idx, 1)[0]);

        showView();

        showControlProperties();
    }

    JSONEdit.controlUp = function(event) {
        event.stopPropagation();
        controlMove(-1);
    }

    JSONEdit.controlDown = function(event) {
        event.stopPropagation();
        controlMove(+1);
    }

    JSONEdit.addTile = function(event) {
        event.stopPropagation();
        var tileTemplate = UIObjectsTemplates["Tile"];
        var newId = $("#newTileId")[0].value;
        if (newId == "" || !tileTemplate || !selectedUIObject || selectedUIObject.type != "LayoutContainer") return;

        var tile = _.merge({}, tileTemplate);
        tile.id = newId;

        var layCont = selectedUIObject.obj;
        layCont.items.push({ href: tile.id });
        tiles.push(tile);

        selectedUIObject = { type: "Tile", obj: tile };

        showView();

        showTileProperties();

    }

    JSONEdit.removeTile = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "Tile") return;
        if (!confirm("Remove the selected tile?")) return;
        var lc = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.href && itm.href == selectedUIObject.obj.id);
        });

        if (!lc || (lc.type != "LayoutContainer" && lc.type != "TileGroup")) return;
        var idx = lc.items.findIndex(tile => { return tile.href == selectedUIObject.obj.id; });
        if (idx == -1) return;
        lc.items.splice(idx, 1);
        idx = tiles.findIndex(t => t.id == selectedUIObject.obj.id);
        if (idx != -1)
            tiles.splice(idx, 1);

        selectedUIObject = { type: lc.type, obj: lc };

        showView();

        switch (lc.type) {
            case "LayoutContainer":
                showLayoutContainerProperties();
                break;
            case "TileGroup":
                showTileGroupProperties();
                break;
        }

    }

    function tileMove(displacement) {
        if (!selectedUIObject || selectedUIObject.type != "Tile") return;

        var lc = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.href && itm.href == selectedUIObject.obj.id);
        });

        if (!lc || (lc.type != "LayoutContainer" && lc.type != "TileGroup")) return;
        var idx = lc.items.findIndex(tile => { return tile.href == selectedUIObject.obj.id; });
        if (idx == -1 || idx + displacement < 0 || idx + displacement >= lc.items.length) return;
        lc.items.splice(idx + displacement, 0, lc.items.splice(idx, 1)[0]);

        showView();

        showTileProperties();
    }

    JSONEdit.tileUp = function(event) {
        event.stopPropagation();
        tileMove(-1);
    }

    JSONEdit.tileDown = function(event) {
        event.stopPropagation();
        tileMove(+1);
    }

    JSONEdit.tilePush = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "Tile") return;

        var outer = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.href && itm.href == selectedUIObject.obj.id);
        });
        if (!outer || (outer.type != "LayoutContainer" && outer.type != "TileGroup")) return;
        var idx = outer.items.findIndex(tile => { return tile.href == selectedUIObject.obj.id; });
        if (idx == -1) return;
        if (idx >= outer.items.length - 1 || outer.items[idx + 1].type != "LayoutContainer") return;
        var inner = outer.items[idx + 1];
        var toPush = outer.items.splice(idx, 1);
        inner.items.push(toPush[0]);

        showView();

        showTileProperties();
    }

    JSONEdit.tilePop = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "Tile") return;

        var inner = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.href && itm.href == selectedUIObject.obj.id);
        });
        if (!inner || (inner.type != "LayoutContainer" && inner.type != "TileGroup")) return;
        var outer = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.id && itm.id == inner.id);
        });
        if (!outer || (outer.type != "LayoutContainer" && outer.type != "TileGroup")) return;

        var idx = inner.items.findIndex(tile => { return tile.href == selectedUIObject.obj.id; });
        if (idx == -1) return;
        var popped = inner.items.splice(idx, 1);

        idx = outer.items.findIndex(tile => { return tile.id == inner.id; });
        if (idx == -1) return;
        outer.items.splice(idx, 0, popped[0]);

        showView();

        showTileProperties();
    }

    JSONEdit.addLayoutContainer = function(event) {
        event.stopPropagation();
        var lcTemplate = UIObjectsTemplates["LayoutContainer"];
        var newId = $("#newLCId")[0].value;
        if (newId == "" || !lcTemplate || !selectedUIObject || selectedUIObject.type != "TileGroup") return;
        var lc = _.merge({}, lcTemplate);
        lc.id = newId;

        var tg = selectedUIObject.obj;
        tg.items.push(lc);

        selectedUIObject = { type: "LayoutContainer", obj: lc };

        showView();

        showLayoutContainerProperties();
    }

    JSONEdit.removeContainer = function(event) {
        event.stopPropagation();
        if (!selectedUIObject || selectedUIObject.type != "LayoutContainer") return;
        if (selectedUIObject.obj.items && selectedUIObject.obj.items.length > 0) {
            alert("Only empty containers can be removed");
            return;
        }
        if (!confirm("Remove the selected container?")) return;

        var lc = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.id && itm.id == selectedUIObject.obj.id);
        });

        if (!lc || (lc.type != "LayoutContainer" && lc.type != "TileGroup")) return;
        var idx = lc.items.findIndex(tile => { return tile.id == selectedUIObject.obj.id; });
        if (idx == -1) return;
        lc.items.splice(idx, 1);

        selectedUIObject = { type: lc.type, obj: lc };

        showView();

        switch (lc.type) {
            case "LayoutContainer":
                showLayoutContainerProperties();
                break;
            case "TileGroup":
                showTileGroupProperties();
                break;
        }

    }

    function containerMove(displacement) {
        if (!selectedUIObject || selectedUIObject.type != "LayoutContainer") return;

        var lc = findItem(tiles, tile => {
            return tile.items && tile.items.find(itm => itm.id && itm.id == selectedUIObject.obj.id);
        });

        if (!lc || (lc.type != "LayoutContainer" && lc.type != "TileGroup")) return;
        var idx = lc.items.findIndex(tile => { return tile.id == selectedUIObject.obj.id; });
        if (idx == -1 || idx + displacement < 0 || idx + displacement >= lc.items.length) return;
        lc.items.splice(idx + displacement, 0, lc.items.splice(idx, 1)[0]);

        showView();

        showLayoutContainerProperties();
    }

    JSONEdit.containerUp = function(event) {
        event.stopPropagation();
        containerMove(-1);
    }

    JSONEdit.containerDown = function(event) {
        event.stopPropagation();
        containerMove(+1);
    }


})(JSONEdit);