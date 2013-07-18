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
 * LoadMonitor object.
 * Monitor's the loading with a loadingbar
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.LoadMonitor",{
    extend: "viewer.components.Component",
    loadMonitor:null,
    constructor: function (conf){
        //default values:
        conf.left = conf.left === undefined ? 5 : conf.left;
        conf.top = conf.top === undefined ? 50 : conf.top;
        viewer.components.LoadMonitor.superclass.constructor.call(this, conf);
        this.initConfig(conf);        
        
        conf.id=conf.name;
        conf.type=viewer.viewercontroller.controller.Component.LOADMONITOR;
        
        this.loadMonitor = this.viewerController.mapComponent.createComponent(conf);
        this.viewerController.mapComponent.addComponent(this.loadMonitor);
        
        return this;
    },
    getExtComponents: function() {
        return [];
    }
});

