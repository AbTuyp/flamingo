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
 * Logger component.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Logger",{    
    config:{
        title: "Logger",
        logLevel: 0
    },
    statics:{
        LEVEL_ERROR: 2,
        LEVEL_WARNING: 1,
        LEVEL_INFO: 0
    },
    popup: null,
    messageDiv:null,
    messages: null, 
    iconDiv: null,
    iconSize: 16,
    constructor: function (conf){        
        this.initConfig(conf);
        this.messages = new Array();  
        var me = this;
        Ext.EventManager.onWindowResize(function(){
            me.onResize();            
        }, this);
    },
    error: function(message){
        if (this.logLevel <= viewer.components.Logger.LEVEL_ERROR){
            this.message(message, viewer.components.LogMessage.ERROR);
        }
    },
    warning: function(message){
        if (this.logLevel <= viewer.components.Logger.LEVEL_WARNING){
            this.message(message, viewer.components.LogMessage.WARNING);
        }
    },
    info: function(message){
        if (this.logLevel <= viewer.components.Logger.LEVEL_INFO){
            this.message(message, viewer.components.LogMessage.INFO);
        }
    },
    /**     
     * @param message the message
     * @param type a message type (error,warning,info)
     */
    message: function(message,type){  
        var newMessage=Ext.create("viewer.components.LogMessage",{message: message,type:type})
        this.messages.push(newMessage);        
        //if popup is created, add the html element for this message.
        if (this.popup!=null){            
            this.messageDiv.appendChild(newMessage.toHtmlElement());           
        }
        this.setIconVisible(true);
    },
    show: function(){
        //if popup is null, create new one.
        if (this.popup ==null){
            this.popup = Ext.create("viewer.components.ScreenPopup",this.config);            
            var cDiv=Ext.get(this.popup.getContentId());            
            Ext.create('Ext.container.Container',{
                renderTo: this.popup.getContentId(),                
                width: '100%',
                items:{
                    xtype: 'button',
                    text: 'Clear'  ,
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.clear()
                            }
                        }
                    }              
                }
            }); 
            
            this.messageDiv=new Ext.Element(document.createElement("div"));
            this.messageDiv.addCls("logger_messages");
            cDiv.appendChild(this.messageDiv);
            
            for (var i=0; i < this.messages.length; i++){
                this.messageDiv.appendChild(this.messages[i].toHtmlElement());
            }            
        }
        this.popup.show();
    },
    clear: function(){
        this.messageDiv.update("");
        this.messages= new Array();
        this.setIconVisible(false);
    },
    /**
     * Set icon visible
     * @param vis boolean, true or false
     */
    setIconVisible: function(vis){           
        if (vis && this.iconDiv==null){
            this.iconDiv=new Ext.Element(document.createElement("div"));
            this.iconDiv.addCls("logger_icon");
            this.iconDiv.applyStyles({
                left: "0px",
                top: (Ext.getBody().getHeight()-this.iconSize) +"px",
                width: this.iconSize+"px",
                height: this.iconSize+"px"
            });
            this.iconDiv.on("click",function (){
                this.show();
                this.setIconVisible(false);
            },this);
            
            Ext.getBody().appendChild(this.iconDiv);            
        }
        if(this.iconDiv!=null){
            this.iconDiv.setVisible(vis);
        }
    }, 
    onResize: function(){
        if (this.iconDiv!=null){
            this.iconDiv.applyStyles({
                top: (Ext.getBody().getHeight()-this.iconSize) +"px"
            });
        }
    }
});

