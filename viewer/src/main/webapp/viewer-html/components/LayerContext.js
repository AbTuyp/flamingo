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
/**
 * LayerContext component
 * Creates a LayerContext component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.LayerContext",{
    extend: "viewer.components.Component",
    container: null,
    htmlContainer: null,
    linksContainer: null,
    config:{
        name: "Informatie kaartlaag",
        title: "",
        titlebarIcon : "",
        tooltip: null
    },
    /**
     * @constructor
     * creating a layercontext module.
     */
    constructor: function (conf){
        conf.isPopup = true;
        viewer.components.LayerContext.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_CLICKED,this.layerClicked,this);
        
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this);
        
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,function(){
            this.selectedContentChanged();
        },this);
        
        return this;
    },
    layerClicked: function(layerObj) {
        // Check if any data is present
        if(
            typeof layerObj.metadata !== 'undefined' ||
            typeof layerObj.download !== 'undefined' ||
            (   typeof layerObj.appLayer !== 'undefined' &&
                typeof layerObj.appLayer.details !== 'undefined' &&
                typeof layerObj.appLayer.details.context !== 'undefined'
            )
        ) {
            this.renderWindow(layerObj);
        }
    },
    renderWindow: function(layerObj) {
        if(this.container === null) {
            this.htmlContainer = Ext.create('Ext.container.Container', {
                flex: 1,
                padding: '0 0 5 0',
                margin: '0 0 5 0',
                border: '0 0 1 0',
                autoScroll: true,
                style: {
                    borderColor: '#E0E0E0',
                    borderStyle: 'solid',
                    borderWidth: '0 0 1px 0'
                },
                layout: 'fit'
            });
            this.linksContainer = Ext.create('Ext.container.Container', {
                height: 20,
                layout: 'hbox'
            });
            this.container = Ext.create('Ext.container.Container', {
                width: '100%',
                height: '100%',
                padding: 5,
                border: 0,
                renderTo: this.getContentDiv(),
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.htmlContainer,
                    this.linksContainer
                ]
            });
        }
        this.linksContainer.removeAll();
        this.htmlContainer.removeAll();
        if(typeof layerObj.metadata !== 'undefined') {
            this.linksContainer.add({
                xtype: 'box',
                html: '<a target="_BLANK" href="' + layerObj.metadata + '">Metadata</a>',
                height: 20,
                width: 80
            });
        }
        if(typeof layerObj.download !== 'undefined') {
            this.linksContainer.add({
                xtype: 'box',
                html: '<a target="_BLANK" href="' + layerObj.download + '">Downloadlink</a>',
                height: 20,
                width: 80
            });
        }
        if( typeof layerObj.appLayer !== 'undefined' &&
            typeof layerObj.appLayer.details !== 'undefined' &&
            typeof layerObj.appLayer.details.context !== 'undefined'
        ) {
            this.htmlContainer.add({
                xtype: 'box',
                html: layerObj.appLayer.details.context
            });
        }
        if(!this.popup.popupWin.isVisible()) {
            this.popup.show();
        }
    },
    selectedContentChanged: function(){
        var me = this;
        if (this.tooltip){
            var tocs= this.viewerController.getComponentsByClassName("viewer.components.TOC");
            this.viewerController.traverseSelectedContent(function(){},function(layer){
                var serviceLayer=me.viewerController.getServiceLayer(layer);
                if( (   serviceLayer.details && 
                        (serviceLayer.details ["metadata.stylesheet"] || serviceLayer.details ["download.url"])) ||  
                    (   typeof layer.details !== 'undefined' &&
                        typeof layer.details.context !== 'undefined'
                    )
                ){
                    for (var i = 0; i < tocs.length; i++){
                        tocs[i].setLayerQtip(me.tooltip,layer.id);
                    }
                }
            });
        }
    },
    getExtComponents: function() {
        return [ (this.container !== null) ? this.container.getId() : '' ];
    }
});

