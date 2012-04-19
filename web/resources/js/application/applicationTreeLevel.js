/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


Ext.Loader.setConfig({enabled:true});
Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.tab.*',
    'Ext.panel.*'
]);

Ext.onReady(function() {
    
    // Definition of the TreeNode model, used in all the tree's
    Ext.define('TreeNode', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'string'},
            {name: 'children', type: 'array'},
            {name: 'name', type: 'string'},
            {name: 'type',  type: 'string'},
            {name: 'status', type: 'string'},
            {name: 'class', type: 'string'},
            {name: 'parentid', type: 'string'},
            {name: 'isLeaf', type: 'boolean'},
            // Text is used by tree, mapped to name
            {name: 'text', type: 'string', mapping: 'name'}
        ],
        get: function(fieldName) {
            var nodeType = '';
            if(fieldName == "icon") {
                nodeType = this.get('type');
                if(nodeType == "category") return foldericon;
                if(nodeType == "layer") return layericon;
                if(nodeType == "document") return documenticon;
                if(nodeType == "service") {
                    var nodeStatus = this.get('status');
                    if(nodeStatus == "ok") return serviceokicon;
                    if(nodeStatus == "error") return serviceerroricon;
                }
            }
            if(fieldName == "leaf") {
                return this.get('isLeaf');
            }
            // Return default value, taken from ExtJS source
            return this[this.persistenceProperty][fieldName];
        }
    });
    
    // Buttonconfig is probably the same for every TreeSelection component
    var buttonIconConfig = {
        moverighticon: moverighticon,
        movelefticon: movelefticon,
        moveupicon: moveupicon,
        movedownicon: movedownicon
    }
    
    // Creation of TreeSelection component
    var kaartSelectie = Ext.create('Ext.ux.b3p.TreeSelection', Ext.apply(buttonIconConfig, {
        // URL of left tree (base tree)
        treeUrl: treeurl,
        // ID used to get root node of the left tree
        defaultRootIdTree: 'c0',
        // Param name used in URL of the left tree
        nodeParamTree: 'nodeId',
        // URL of right tree (tree where selection is build)
        selectedLayersUrl: selectedlayersurl,
        // ID used to get root node of the selection tree
        defaultRootIdSelectedLayers: levelid,
        // Param name used in URL of the selection tree
        nodeParamSelectedLayers: 'levelId',
        // DIV-ID to which the left tree is rendered
        treeContainer: 'servicetree-container',
        // DIV-ID to which the right tree is rendered
        selectedLayersContainer: 'selected-layers',
        // DIV-ID to which the selection buttons are rendered
        layerSelectionButtons: 'layerselection-buttons',
        // DIV-ID to which the move buttons are rendered
        layerMoveButtons: 'layermove-buttons'
    }));
    
    // document tree
    var docsSelectie = Ext.create('Ext.ux.b3p.TreeSelection', Ext.apply(buttonIconConfig, {
        // URL of left tree (base tree)
        treeUrl: doctreeurl,
        // ID used to get root node of the left tree
        defaultRootIdTree: 'c0',
        // Param name used in URL of the left tree
        nodeParamTree: 'nodeId',
        // URL of right tree (tree where selection is build)
        selectedLayersUrl: selecteddocsurl,
        // ID used to get root node of the selection tree
        defaultRootIdSelectedLayers: levelid,
        // Param name used in URL of the selection tree
        nodeParamSelectedLayers: 'levelId',
        // DIV-ID to which the left tree is rendered
        treeContainer: 'documenttree-container',
        // DIV-ID to which the right tree is rendered
        selectedLayersContainer: 'selected-doc',
        // DIV-ID to which the selection buttons are rendered
        layerSelectionButtons: 'docselection-buttons',
        // DIV-ID to which the move buttons are rendered
        layerMoveButtons: 'docmove-buttons'
    }));
    
    var tabconfig = [{
        contentEl:'rights-tab', 
        title: 'Rechten'
    },{
        contentEl:'documents-tab', 
        title: 'Documenten'
    },{
        contentEl:'context-tab', 
        title: 'Context'
    }];

    if(layersAllowed) {
        tabconfig.unshift({
            contentEl:'tree-tab', 
            title: 'Kaarten'
        });
    }
    
    var htmlEditorRendered = false;
    Ext.select('.tabdiv', true).removeCls('tabdiv').addCls('x-hide-offsets');
    Ext.createWidget('tabpanel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        hideMode: 'offsets',
        defaults: {
            bodyPadding: 10,
            hideMode: 'offsets'
        },
        layoutOnTabChange: true,
        items: tabconfig,
        listeners: {
            tabchange: function(panel, activetab, previoustab) {
                if(activetab.contentEl && activetab.contentEl === 'context-tab' && !htmlEditorRendered) {
                    // HTML editor is rendered when the tab is first opened. This prevents a bug where the contents could not be edited
                    Ext.create('Ext.form.field.HtmlEditor', {
                        id: 'extContextHtmlEditor',
                        width: 475,
                        maxWidth: 475,
                        height: 400,
                        maxHeight: 400,
                        value: Ext.get('context_textarea').dom.value,
                        renderTo: 'contextHtmlEditorContainer'
                    });
                    htmlEditorRendered = true;
                }
            }
        }
    });
    
    Ext.get('levelform').on('submit', function() {
        Ext.fly('selectedlayersinput').set({value:kaartSelectie.getSelection()});
        Ext.fly('selecteddocsinput').set({value:docsSelectie.getSelection()});
        Ext.get('context_textarea').dom.value = Ext.getCmp('extContextHtmlEditor').getValue();
    });
});