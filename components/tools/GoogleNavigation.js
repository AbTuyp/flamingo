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
 * GoogleNavigation component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.GoogleNavigation",{
    extend: "viewer.components.tools.Tool",
    config:{
        name: "Google Navigation",
        navigationPanel : true
    },
    constructor: function (conf){        
        viewer.components.tools.GoogleNavigation.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        conf.type = viewer.viewercontroller.controller.Tool.MEASURE;        
        this.initTool(conf);
        return this;
    }
});