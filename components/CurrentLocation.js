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
 * CurrentLocation tool
 * Gets the location by using the Geo API
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.CurrentLocation",{
    extend: "viewer.components.Component",
    button: null,
    watchId: null,
    geolocationProj: null,
    mapProj: null,
    MARKER_PREFIX: "CurrentLocation_",
    config: {
        interval: null,
        iconUrl_up: null,
        iconUrl_over: null,
        iconUrl_sel: null,
        iconUrl_dis: null
    },
    constructor: function(config){
        this.callParent(config);
        this.geolocationProj= new Proj4js.Proj("EPSG:4236");
        //needs to be configurable
        if (Proj4js.defs["EPSG:28992"]==undefined){
            Proj4js.defs["EPSG:28992"]= "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
        }
        this.mapProj= new Proj4js.Proj("EPSG:28992");
        this.createButton();
    },
    /**
     * Create the button
     */
    createButton: function(){
        //if there is a interval defined. Make the button a toggle
        var type=viewer.viewercontroller.controller.Tool.TOGGLE;
        if (this.interval==null){
            type=viewer.viewercontroller.controller.Tool.BUTTON;
        }
        this.button= this.viewerController.mapComponent.createTool({
            type: type,
            name: this.getName(),
            iconUrl_up: this.iconUrl_up,
            iconUrl_over: this.iconUrl_over,
            iconUrl_sel: this.iconUrl_sel,
            iconUrl_dis: this.iconUrl_dis,
            tooltip: this.config.tooltip || null,
            viewerController: this.viewerController
        });
        this.viewerController.mapComponent.addTool(this.button);
        
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.buttonDown, this);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,this.buttonUp, this);
    },
    buttonDown: function(){
        if (this.interval==null){
            this.getLocation();
        }else{
            this.startWatch();
        }
    },
    buttonUp: function(){
        this.stopWatch();
    },
    /**
     * Get the location.
     */
    getLocation: function(){
        navigator.geolocation.getCurrentPosition(this.locationHandler,this.errorHandler);
    },
    /**
     *Start watching the position
     */
    startWatch: function(){
        this.watchId = navigator.geolocation.watchPosition(this.locationHandler,this.errorHandler,{
            timeout: this.interval
        })
    },
    /**
     *Stop watching the position
     */
    stopWatch: function(){
        navigator.geolocation.clearWatch(this.watchId);
        this.viewerController.mapComponent.getMap().removeMarker(MARKER_PREFIX+this.getName());
    },
    /**
     * Handles the location
     */
    locationHandler: function(position){
        var lat = Number(location.coords.latitude);
        var lon = Number(location.coords.longitude);
        var point = this.transformLatLon(lat,lon);
        this.viewerController.mapComponent.getMap().moveTo(point.x,point.y);
        this.viewerController.mapComponent.getMap().setMarker(MARKER_PREFIX+this.getName(),point.x,point.y);
    },
    /**
     * Handle errors.
     */
    errorHandler: function(error){
        this.viewerController.logger.error("Error while recieving location: "+error);
    },
    transformLatLon: function(x,y){
        var point = new Proj4js.Point(x,y);
        Proj4js.transform(this.geolocationProj,this.mapProj,point);
        return point;
    }
});