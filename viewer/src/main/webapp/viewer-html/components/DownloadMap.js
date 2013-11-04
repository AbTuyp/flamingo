/* 
 * Copyright (C) 2013 B3Partners B.V.
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
 * A button which enables the user to download the current map (extent and layers) as an image.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.DownloadMap",{
    extend: "viewer.components.Print",
    config:{
        tooltip : null
    },
    iconUrl_up: null,
    iconUrl_over: null,
    button: null,
    constructor: function (conf){        
        this.hasButton = false;
        viewer.components.tools.DownloadMap.superclass.constructor.call(this, conf);
        this.initConfig(conf);   
        
        this.iconUrl_up= contextPath+"/viewer-html/components/resources/images/downloadMap/up.png";
        this.iconUrl_over= contextPath+"/viewer-html/components/resources/images/downloadMap/over.png";
        
        this.button= this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.BUTTON,
            iconUrl_up: this.iconUrl_up,
            iconUrl_over: this.iconUrl_over,
            tooltip: this.tooltip || null,
            viewerController: this.viewerController
        });
        this.viewerController.mapComponent.addTool(this.button);
        
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.buttonDown, this);
        return this;
    },
    /**
     * When the button is hit 
     * @param button the button
     * @param object the options.        
     */
    buttonDown : function(button,object){        
        var properties = this.getProperties();
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess,this.imageFailure);
    },
    imageSuccess: function(imageUrl){        
        if(Ext.isEmpty(imageUrl) || !Ext.isDefined(imageUrl)) imageUrl = null;
        if(imageUrl === null) document.getElementById('previewImg').innerHTML = 'Afbeelding laden mislukt';
        else {
            window.open(imageUrl, '_blank');
        }
    },
    getProperties: function() {
        var properties = {};
        /*properties.angle = this.rotateSlider.getValue();
        properties.quality = this.qualitySlider.getValue();*/
        properties.appId = this.viewerController.app.id;
        var mapProperties = this.getMapValues();
        Ext.apply(properties, mapProperties);
        return properties;
    },
    /**
     *Called when the imageUrl is unsuccesfully returned
     *@param error the error message
     */
    imageFailure: function(error){
        console.log(error);
    }
});