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
 * @class 
 * @constructor
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    map: null,
    deactivatedControls: null,
    /**
     * Constructor
     * @param conf the configuration object
     * @param frameworkTool the openlayers control
     * @param map the viewer.viewercontroller.openlayers.OpenLayersMap
     */
    constructor : function (conf,frameworkTool,map){
        viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        this.map=map;
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        return this;
    },
    activate: function(){
        //if mobile: disable the navigation control. To make sure the click can be handled
        //Click won't be handled if there is a navigation controller enabled (for mobile) 
        if (MobileManager.isMobile()){
            if (this.deactivatedControls==null){
                this.deactivatedControls=[];
            }
            var navigationTools= this.map.getFrameworkMap().getControlsByClass("OpenLayers.Control.Navigation");
            for (var i=0; i < navigationTools.length; i++){
                if (navigationTools[i].active){
                    this.deactivatedControls.push(navigationTools[i]);
                    navigationTools[i].deactivate();
                }
            }
        }
        //set dragPan.activate();
        this.map.getFrameworkMap().events.register("click", this, this.handleClick);
    },
    deactivate: function(){
        //if mobile: enable the disactivated controls again
        if (MobileManager.isMobile()){
            while (!Ext.isEmpty(this.deactivatedControls)){
                var disCont = this.deactivatedControls.pop();
                disCont.activate();
            }
        }
        this.map.getFrameworkMap().events.unregister("click", this, this.handleClick);
    },
    handleClick: function(event){
        var opx = this.map.getFrameworkMap().getLonLatFromPixel(event.xy)
        var options = {
            x: event.xy.x,
            y: event.xy.y,
            coord: {
                x: opx.lon,
                y: opx.lat
            }
        };
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    }  
});