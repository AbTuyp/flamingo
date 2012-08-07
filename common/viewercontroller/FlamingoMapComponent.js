/**
 * @class 
 * @augments MapComponent
 * @description MapComponent subclass for Flamingo
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 **/
Ext.define("viewer.viewercontroller.FlamingoMapComponent",{
    extend: "viewer.viewercontroller.MapComponent",
    viewerObject : null,
    toolGroupId: "toolgroup",
    toolGroupCreated: false,
    flamingoId: "flamingo",
    mainContainerId: "mainContainer",
    bottomContainerId: null,
    toolMargin: 30,
    enabledEvents: new Object(),
    config: {
        movetime: null,
        movesteps: null
    },
    /**
     * 
     * @constructur
     */
    constructor :function (viewerController, domId, config){
        viewer.viewercontroller.FlamingoMapComponent.superclass.constructor.call(this, viewerController,domId,config);        
        var so = new SWFObject( contextPath + "/flamingo/flamingo.swf?config=config.xml", this.flamingoId, "100%", "100%", "8", "#FFFFFF");
        so.addParam("wmode", "transparent");
        so.write(domId);
        this.viewerObject = document.getElementById("flamingo");
        return this;
    },
    /**
     * Initialize the events. These events are specific for flamingo.
     */
    initEvents : function(){
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_DOWN]              	= "onEvent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_UP]                	= "onEvent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_OVER]                	= "onEvent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_CAPABILITIES]        	= "onGetCapabilities";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE]         	= "onConfigComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]               = "onGeometryDrawFinished";
        this.eventList[viewer.viewercontroller.controller.Event.ON_REQUEST]                     = "onRequest";
        this.eventList[viewer.viewercontroller.controller.Event.ON_SET_TOOL]                    = "onSetTool";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO]            = "onIdentify";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_PROGRESS]   = "onIdentifyProgress";        
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA]       = "onIdentifyData";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE] = "onUpdateComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT]      = "onReallyChangedExtent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT]               = "onChangeExtent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_ADDED]                 = "onAddLayer";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED]               = "onRemoveLayer";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MAPTIP_DATA]                 = "onMaptipData";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MAPTIP]                      = "onMaptip";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MAPTIP_CANCEL]               = "onMaptipCancel";        
        this.eventList[viewer.viewercontroller.controller.Event.ON_MAP_CLICKED]                 = "onMapClicked";        
        this.eventList[viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED]      = "onActiveFeatureChange";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ACTIVATE]                    = "onActivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_DEACTIVATE]                  = "onDeactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_SERVICE_INFO]            = "onGetServiceInfo";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED]    = ["onShowLayer","onHideLayer"];
    },
    
    /**
     *Fixed for flamingo??
     */
    getId : function() {
        return "flamingo";        
    },
    /**
     *Creates a Openlayers.Map object for this framework. See the openlayers.map docs
     *@param id the id of the map that is configured in the configuration xml
     *@param options Options for the map
     *@returns a FlamingoMapComponent
     */
    createMap : function(id,options){
        options.id=id;
        options.mapComponent=this;
        if (this.resolutions!=null && this.resolutions != ""){
            options.options.resolutions = this.resolutions;
        }if (this.movetime!=null && this.movetime!=""){
            options.options.movetime=this.movetime;
        }if (this.movesteps!=null && this.movesteps!=""){
            options.options.movesteps=this.movesteps;
        }        
        var map = new viewer.viewercontroller.flamingo.FlamingoMap(options);
        
        return map;
    },
    /**
     *See @link MapComponent.createWMSLayer
     */
    createWMSLayer : function(name, url,ogcParams,options,viewerController){
        var object=new Object();
        object["name"]=name;
        object["url"]=url;    
        object.timeout= 30;
        object.retryonerror= 1;
        object.initService=false;
        
        var ide=null;
        for (var key in ogcParams){
            object[key]=ogcParams[key];
        }
        for (var key in options){
            if (key.toLowerCase()=="id"){
                ide=options[key];
            }else{
                object[key]=options[key];
            }
        }
        if(ide == null){
            ide = name;
        }
        var config = {
            id: ide,
            options: object,
            frameworkLayer : this.viewerObject,
            viewerController: this.viewerController
        };
        return new viewer.viewercontroller.flamingo.FlamingoWMSLayer(config);
    },
    /**
     * @see viewer.viewercontroller.MapComponent@createTilingLayer
     */
    createTilingLayer: function (name, url, options,viewerController){
        if (options==undefined || options==null){
            options={};
        }
        options.url=url;
        options.type=options.protocol;
        return Ext.create("viewer.viewercontroller.flamingo.FlamingoTilingLayer",options);
    },
    createArcConfig: function(name,url,options,viewerController){
        var server = url.substring(0,url.indexOf("/",7));
        var servlet;
        if(url.indexOf("?") != -1){
            servlet = url.substring(url.indexOf("/",7)+1, url.indexOf("?"));
        }else{
            servlet = url.substring(url.indexOf("/",7)+1);
        }
        // Make flamingo ArcServer specific options
        options.visibleids = options.layers;
        /*if (layer.queryable){
            options.identifyids= layer.name;
        }        */
        var ide=options.id;
        delete options.id;
        options.name=name;
        options.server=server;
        options.servlet=servlet;
        options.timeout= 30;
        options.retryonerror= 1;
        options.initService=false;
        var config ={
            id: ide,
            options: options,
            frameworkLayer : this.viewerObject,
            viewerController: viewerController
        };
        return config;
    },
    //createArcIMSLayer : function(name,server,servlet,mapservice,options,viewerController){
    createArcIMSLayer: function(name,url,options,viewerController){
        var config=this.createArcConfig(name,url,options,viewerController);
        return new viewer.viewercontroller.flamingo.FlamingoArcIMSLayer(config);
    },
    createArcServerLayer : function(name,url,options,viewerController){            
        var config=this.createArcConfig(name,url,options,viewerController);
        options.mapservice=options.servlet.substring(21,options.servlet.toLowerCase().indexOf("/mapserver"));        
        //xxx for REST remove the next line.
        delete config.options.servlet;        
        config.options.esriArcServerVersion="9.3";
        config.options.dataframe="layers";
        return new viewer.viewercontroller.flamingo.FlamingoArcServerLayer(config);
    },
    createImageLayer : function (name, url, extent,viewerController){
        return Ext.create("viewer.viewercontroller.flamingo.FlamingoImageLayer",
        {
            id: name,
            url: url,
            extent : extent,
            frameworkLayer : this.viewerObject,
            viewerController: this.viewerController
        });
    },
    /**
     * See @link MapComponent.createVectorLayer
     */
    createVectorLayer : function (config){        
        config.frameworkLayer = this.viewerObject
        return new viewer.viewercontroller.flamingo.FlamingoVectorLayer(config);
    },
    /** @See MapComponent.createTool
    * @param conf the configuration, containing:
    * @param conf.id the id of the toolmapclick
    * @param conf.type the type of the tool
    * @param conf.handler.fn The function to be called
    * @param conf.handler.scope The scope in which the function has to be called
    * @param conf.viewerController The viewercontrollerreference 
    **/
    createTool: function (conf){   
        if (Ext.isEmpty(conf.listenTo)){
            conf.listenTo=this.getMap().getId();
        }
        conf.viewerController = this.viewerController;
        var tool = null;// new viewer.viewercontroller.flamingo.FlamingoTool(conf);
        /*if(conf.type == Tool.GET_FEATURE_INFO){
            this.registerEvent(viewer.viewercontroller.controller.ON_GET_FEATURE_INFO, this.getMap(), options["handlerBeforeGetFeatureHandler"]);
            this.registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, this.getMap(), options["handlerGetFeatureHandler"]);
        }else */
        if(conf.type == viewer.viewercontroller.controller.Tool.MAP_CLICK){           
            tool = Ext.create ("viewer.viewercontroller.flamingo.ToolMapClick",conf);
        }else{
            tool = new viewer.viewercontroller.flamingo.FlamingoTool(conf);
        }
        return tool;
    },
    
    /**
     *Create a flamingo component.
     *@param Configuration object
     *@see viewer.viewercontroller.flamingo.FlamingoComponent#constructor
     */
    createComponent: function (conf){  
        //set the listen to as default to the map
        if (Ext.isEmpty(conf.listenTo)){
            conf.listenTo=this.getMap().getId();
        }
        //set the name as id.
        if (Ext.isEmpty(conf.id)){
            conf.id=conf.name;
        }
        
        conf.viewerController = this.viewerController;
        var component;
        if(conf.type == viewer.viewercontroller.controller.Component.OVERVIEW){
            component = Ext.create ("viewer.viewercontroller.flamingo.Overview",conf);
        }else{
            component = new viewer.viewercontroller.flamingo.FlamingoComponent(conf);
        }
        return component;
    },
    /**
     * Creates a ToolGroup that is needed to add tools.
     * @param configuration has all the xml configurations that are passed to the flamingo call.
     */
    createToolGroup : function(configuration){
        var layout= this.viewerController.getLayout('top_menu');
        var height= layout.height ? layout.height : -1;        
        var xml="";
        if (height>=0){
            var heightParam=height;
            if (layout.heightmeasure){
                heightParam+= layout.heightmeasure == "px" ? "" : layout.heightmeasure;
            }
            xml+="<fmc:Container top='0' width='100%' height='"+heightParam+"'";
            if (layout.bgcolor){
                xml+="backgroundcolor='"+layout.bgcolor+"'";
            }
            xml+=">";
        }
        xml+="<fmc:ToolGroup ";
        for (var key in configuration){
            xml+=key+"=\""+configuration[key]+"\" ";
        }
        xml+="></fmc:ToolGroup>";        
        if (height>=0){
             xml+="</fmc:Container>";
        }
        this.viewerObject.callMethod(this.mainContainerId,'addComponent',xml);        
    },
    /**
     *See @link MapComponent.addTool
     */
    addTool : function(tool){        
        if (!(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            Ext.Error.raise({
                msg: "The given tool is not of type 'FlamingoTool'"               
            });
        }
        //calc the number of visible tools.
        var visibleTools=this.getNumberOfVisibleTools();
        //Set the left if no left or right is set
        if (tool.getLeft()==null && tool.getRight()==null){
            tool.setLeft(visibleTools * this.toolMargin);
        }        
        this.getToolGroup(tool);
        viewer.viewercontroller.FlamingoMapComponent.superclass.addTool.call(this,tool);
        //var isToolGroup=this.viewerObject.callMethod(this.flamingoId,'isLoaded',this.toolGroupId,true);        
        
        var toolXml="<fmc:ToolGroup id='"+this.toolGroupId+"'>";
        toolXml+=tool.toXML();
        toolXml+="</fmc:ToolGroup>";        
        this.viewerObject.callMethod(this.flamingoId,'addComponent',toolXml);         
        var toolsVisible=0;
        //if tool is not visible and not a JSbutton check if it's the first.
        var isJsButton=false;
        try{
            isJsButton=tool instanceof viewer.components.tools.JSButton;
        }catch(e){
            isJsButton=false;
        }
        if (tool.getVisible() && !isJsButton){
            for (var i=0; i < this.tools.length; i++){
                //only count the visible and not JSbuttons.
                var jsButton= false;
                try{
                    jsButton=this.tools[i] instanceof viewer.components.tools.JSButton;
                }catch(e){
                    jsButton=false;
                }
                if (this.tools[i].getVisible() && !jsButton){
                    toolsVisible++;
                }
            }
            if (toolsVisible ==1){
                this.activateTool(tool.getId());
            }
        }
        
    },
    /**
     *Get the amount of visible tools.
     *@return the amount of visible tools
     */
    getNumberOfVisibleTools: function(){
        var count=0;
        for (var i=0; i < this.tools.length; i++){
            if (this.tools[i].getVisible()){
                count++;
            }
        }
        return count;
    },
    /**
     * Get the toolgroup
     */
    getToolGroup : function(tool){
        if (!this.toolGroupCreated){
            var lt = this.getMap().id;
            if ( lt==undefined || lt==null ){
                lt=tool.getListenTo();
            }
            this.createToolGroup({
                id: this.toolGroupId,
                listento: lt,
                width: "100%",
                height: "100",
                left: "5",
                top: "5"                
            });
            this.toolGroupCreated=true;
        }
        return this.toolGroupId;
    },
    /**
     * Create the bottomcontent container
     * @param component. The first component
     * @return the id of the new container of null if it's not created
     */
    createBottomContent : function(){
        var blayout=this.viewerController.getLayout('content_bottom')
        var height = blayout && blayout.height && blayout.height >=0 ? blayout.height : -1;
        if (height>0){            
            if (blayout.heightmeasure){
                height+= blayout.heightmeasure == "px" ? "" : blayout.heightmeasure;
            }            
            var xml="<fmc:Container id='bottomContainer' bottom='bottom' width='100%' height='"+height+"'";
            if (blayout.bgcolor){
                xml+="backgroundcolor='"+blayout.bgcolor+"'";
            }
            xml+=">";            
            xml+="</fmc:Container>";
            this.addComponentXml(xml);
            return "bottomContainer";
        }
        return null;
    },
    /**
     */
    addComponentXml: function (xml){
        this.viewerObject.callMethod(this.mainContainerId,'addComponent',xml); 
    },
    /**
     * See @link MapComponent.activateTool
     */
    activateTool : function (id){
        this.viewerObject.call(this.toolGroupId, "setTool", id);
    },
    /**
     * See @link MapComponent.removeTool
     **/
    removeTool : function (tool){
        if (!(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            Ext.Error.raise({msg: "The given tool is not of type 'FlamingoTool'"});
        }
        this.viewerObject.callMethod(tool.getId(),'setVisible',false);
        MapComponent.prototype.removeTool.call(this,tool);
    },
    /**
     * See @link MapComponent.removeToolById
     */
    removeToolById : function (id){
        var tool = this.getTool(id);
        if(tool == null || !(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            Ext.Error.raise({msg: "The given tool is not of type 'FlamingoTool' or the given id does not exist"});
        }
        this.removeTool(tool);
    },
    /**
     * Adds a container to flamingo.
     * @param component the FlamingoComponent that must be added.
     */
    addComponent: function(component){
        if (!(component instanceof viewer.viewercontroller.flamingo.FlamingoComponent)){
            Ext.Error.raise({
                msg: "The given Component is not of type 'FlamingoComponent'"               
            });
        }
        viewer.viewercontroller.FlamingoMapComponent.superclass.addComponent.call(this,component);
        
        var container=this.mainContainerId;
        var xml=component.toXML();
        //these components can be added to the bottom if its configured in the layout.
        if (component.config.regionName=="content_bottom"){
            if (this.viewerController.getLayoutHeight("content_bottom")>=0 && this.bottomContainerId==null){                
                this.bottomContainerId=this.createBottomContent();
            }
            if (this.bottomContainerId){
                container=this.bottomContainerId;
            }
        }
        if (container){
            //add the component.
            this.viewerObject.callMethod(container,'addComponent',xml);         
        }
        if (component.type==viewer.viewercontroller.controller.Component.MAPTIP){
            //if it's a maptip check for the maptipdelay. If not set, set it.
            var maptipdelay= this.viewerObject.callMethod(this.getMap().id,'getMaptipdelay');             
            if (maptipdelay==undefined){
                this.viewerObject.callMethod(this.getMap().id,'setMaptipdelay',component.getMaptipdelay()); 
            }
        }
    },
    /**
     *Add a map to the MapComponent.
     *For know only 1 map supported.
     */
    addMap : function (map){
        if (!(map instanceof viewer.viewercontroller.flamingo.FlamingoMap)){
            Ext.Error.raise({msg: "FlamingoMapComponent.addMap(): The given map is not of the type 'FlamingoMap'"});
        }
        this.viewerObject.callMethod(this.mainContainerId,'addComponent',map.toXML()); 
        this.maps.push(map);
    },
    /**
     *Get the map by id. If no id is given and 1 map is available that map wil be returned
     *@param mapId the mapId
     *@returns the Map with the id, or the only map.
     */
    getMap : function (mapId){
        if (mapId==undefined && this.maps.length==1){
            return this.maps[0];
        }
        var availableMaps="";
        for (var i=0; i < this.maps.length; i++){
            if (i!=0)
                availableMaps+=",";
            availableMaps+=this.maps[i].getId();
            if (this.maps[i].getId()==mapId){
                return this.maps[i];
            }
        }
        return null;
        //Ext.Error.raise({msg: "FlamingoMapComponent.getMap(): Map with id: "+mapId+" not found! Available maps: "+availableMaps});
    },
    /****************************************************************Event handling***********************************************************/

    /**
     * Registers an event to a handler, on a object. Flamingo doesn't implement per component eventhandling,
     * so this MapComponent stores the event in one big array.
     * This array is a two-dimensional array: the first index is the eventname (the generic one! Actually, not a name, but the given id).
     * The second index is the id of the object. 
     */
    registerEvent : function (event,object,handler,scope){
        if(object instanceof Ext.util.Observable){
            if(object == this){
                this.addListener(event,handler,scope);
            }else{
                object.registerEvent(event,handler,scope);
            }
        }else{
            alert("Unmapped event:",event);
            if( this.events[event] == undefined){
                this.events[event] = new Object();
            }
        
            if (this.events[event][object.getId()]==undefined){
                this.events[event][object.getId()]=new Array();
            }
            this.events[event][object.getId()].push(handler);
        }
    },
    /**
     *Unregister the event @link see MapComponent.unRegisterEvent
     */
    unRegisterEvent : function (event,object,handler){
        var newHandlerArray=new Array();
        for (var i=0; i < this.events[event][object.getId()].length; i++){
            if (handler != this.events[event][object.getId()][i]){
                newHandlerArray.push(this.events[event][object.getId()][i]);
            }
        }    
        if (newHandlerArray.length==0){
            delete this.events[event][object.getId()];
        }else{
            this.events[event][object.getId()]=newHandlerArray;
        }
    
    },
    getObject : function(name){
        if( name instanceof Array){
            name = name[0];
        } 
        name=""+name;                
        if(this.getMap(name)!= null){
            return this.getMap(name);
        }else if (this.getMap() && this.getMap().getLayer(name)!=null){
            return this.getMap().getLayer(name);
        }else if(this.getMap() && name.indexOf(this.getMap().getId()+"_")==0 && this.getMap().getLayer( (name.replace(this.getMap().getId() + "_" ,""))) != null){        
            return this.getMap().getLayer( (name.replace(this.getMap().getId() + "_" ,"")));
        }else if(this.getTool(name) != null){
            return this.getTool(name);
        }else if(name == this.getId()){
            return this;
        }else if(this.getMap() && this.getMap().editMapId){
        }else{
            return null;
        }
    },
    /**
     * Handles all the events. This function retrieves the function registered to this event.
     * Flamingo doesn't understand per object eventhandling, but instead it fires an event, with a id of the object (and a bunch of parameters).
     * In this function we translate the events to per object events, and more specific events (button up/down)
     */
    handleEvents : function (event, component){
        var id = component[0];
        var object = this.getObject(id);
        // onEvent is a general event, fired when a jsButton is hovered over, pressed or released. Here we specify which it was.
        if(event == "onEvent"){
            if(component[1]["rollover"] || component[1]["rolloff"]){
                event = viewer.viewercontroller.controller.Event.ON_EVENT_OVER;
            }else{
                if(component[1]["toggle"]){
                    if(component[1]["selected"] && component[1]["down"]){
                        event = viewer.viewercontroller.controller.Event.ON_EVENT_DOWN;                        
                    }else if (!component[1]["selected"] && component[1]["down"]){
                        event = viewer.viewercontroller.controller.Event.ON_EVENT_UP;
                    }
                }else{
                    if(component[1]["down"]){
                        event = viewer.viewercontroller.controller.Event.ON_EVENT_DOWN;
                    }
                }
            }
        }else if(event == "onHideLayer" || event == "onShowLayer"){
            var layer = this.getObject(component[1]);
            var map = this.getMap();
            var visible = event == "onShowLayer";
            event = viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED;
            component = new Object();
            component.layer = layer;
            component.visible = visible;
        }else{
            // Translate the specific name to the generic name. 
            event = this.getGenericEventName(event);
            if(event==null)
                return;
        }
        if (event==viewer.viewercontroller.controller.Event.ON_REQUEST){
            var obj=component[2];
            if (obj.requesttype=="GetMap"){
                var tokens = component[0].split("_");

                /* TODO kijken of we de functie kunnen uitbreiden zodat dit werkt met meer
                 * dan 3 tokens en of dat nut heeft. Kun je weten aan de hand van aantal tokens
                 * om wat voor layer het gaat ? */
                if (tokens.length == 2){
                    this.getMap(tokens[0]).getLayer(tokens[1]).setURL(obj.url);
                }
            
                if (tokens.length == 3){
                    this.getMap(tokens[0]).getLayer(tokens[1]+"_"+tokens[2]).setURL(obj.url);
                }
            }        
        }else if(event==viewer.viewercontroller.controller.Event.ON_SET_TOOL){
            //onchange tool is called for a tool group but event is registerd on the MapComponent
            id=this.getId();
            object = this.getObject(id);
        }else if(event==viewer.viewercontroller.controller.Event.ON_ACTIVATE){
            console.log("On Activate");
        }else if(event==viewer.viewercontroller.controller.Event.ON_DEACTIVATE){
            console.log("On Deactivate");
        }else if( event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO){                 
        //component = {extent: component[1]};
            var me = this;
            var extent=component[1];
            var centerx=(extent.minx+extent.maxx)/2;
            var centery=(extent.miny+extent.maxy)/2;
            var pixel = object.coordinateToPixel(centerx,centery);
            var comp= {
                coord:{
                    x: centerx,
                    y: centery
                },
                x: pixel.x,
                y: pixel.y                
            };
            component=comp;
            
        }else if ( event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_PROGRESS){
            component= {
                nr: component[1],
                total: component[2]
            };
        }else if( event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA){           
            var extent=component[2];
            var centerx=(extent.minx+extent.maxx)/2;
            var centery=(extent.miny+extent.maxy)/2;
            var map= object.map;
            var pixel = map.coordinateToPixel(centerx,centery);
            var comp= {
                coord:{
                    x: centerx,
                    y: centery
                },
                x: pixel.x,
                y: pixel.y                
            };
            //comp.data = component[1];
            comp.extent= extent;
            comp.nr = component[3];
            comp.total=component[4];
            //correct the data
            var data=[];
            var i=0;
            for (var layerName in component[1]){
                data[i]={
                    request : {
                        appLayer: object.appLayerId
                        
                    },
                    features: component[1][layerName]
                };
            }       
            comp.data=data;
            component = comp;
        }else if (event == viewer.viewercontroller.controller.Event.ON_LAYER_ADDED){
            var layerId=component[1];
            //remove id_ from the layer id
            if (layerId.indexOf(id+"_")==0){
                layerId = layerId.substring(id.length+1);
            }
            var layer=object.getLayer(layerId);
            //layer not found? don't throw event.
            if (layer==null){
                return;
            }
            component={layer: layer};
        }else if(event == viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED){
            var layerId=component[1];
            //remove id_ from the layer id
            if (layerId.indexOf(id+"_")==0){
                layerId = layerId.substring(id.length+1);
            }
            var layer=object.getLayer(layerId);            
            component= new Object()
            component.layer=layer;
        }else if (event == viewer.viewercontroller.controller.Event.ON_MAPTIP){
            var comp = new Object();    
            comp.x=component[1];
            comp.y=component[2];
            comp.coord=component[3];
            component=comp;
        }else if (event == viewer.viewercontroller.controller.Event.ON_MAPTIP_DATA){            
            var comp=new Object();
            comp.coord=component[2];
            //comp.data=component[1];
            comp.x = component[2].x;
            comp.y = component[2].y;
            comp.coord.x=component[2].minx;
            comp.coord.y=component[2].miny;            
            var data=[];
            var i=0;
            for (var layerName in component[1]){
                data[i]={
                    request : {
                        appLayer: object.appLayerId
                        
                    },
                    features: component[1][layerName]
                };
            }            
            comp.data=data;
            component=comp;
        }else if(event == viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED ||event == viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED){
            var layerName = component[1].fmc_layername;
            var layerObj = this.getMap().getLayer(layerName);
            var featureObj = Ext.create("viewer.viewercontroller.controller.Feature",component[1]);
            component = featureObj;
            object = layerObj;
        }else if (event == viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE){
            if(!this.viewerController.layersInitialized){
                return;
            }
        }else if (event == viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT){            
            var comp={}
            comp.extent= new viewer.viewercontroller.controller.Extent(component[1].minx,component[1].miny,component[1].maxx,component[1].maxy);
            component=comp;
        }
        if(object != undefined){
            object.fire(event,component);
        }
    },
    fire : function (event,options){
        this.fireEvent (event,this,options);
    },
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        viewer.viewercontroller.FlamingoMapComponent.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        if (this.viewerObject!=undefined && typeof this.viewerObject.callMethod == 'function' && this.eventList!=undefined){
            var flamEvent=this.eventList[event];
            if (flamEvent!=undefined){
                //if not enabled yet, enable
                if (this.enabledEvents[flamEvent]==undefined){
                    this.viewerObject.callMethod(this.getId(),"addAllowExternalInterface",this.getId()+"."+flamEvent);
                    this.enabledEvents[flamEvent]=true;                    
                }
            }     
        }else{
            var thisObj=this;
            setTimeout(function(){
                thisObj.addListener(event,handler,scope);
            },100);
        }
    },    
    /**
     * @see viewer.viewercontroller.MapComponent#getWidth
     */
    getWidth: function(){
        return this.viewerObject.callMethod(this.flamingoId,"getWidth");
    },    
    /**
     * @see viewer.viewercontroller.MapComponent#getHeight
     */
    getHeight: function(){
        return this.viewerObject.callMethod(this.flamingoId,"getHeight");
    }
});

/**
* Entrypoint for flamingoevents. This function propagates the events to the webMapController (handleEvents).
*/
function dispatchEventJS(event, comp) {
    if(comp [0]== null){
            comp[0] = viewerController.mapComponent.getId();
        comp[1] = new Object();
    }
    try{
        viewerController.mapComponent.handleEvents(event,comp);    
    }catch(e){
        if (window.console && console.log)
            console.log(e);
    }
}
