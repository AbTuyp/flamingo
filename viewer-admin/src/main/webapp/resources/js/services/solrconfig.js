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
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    //'Ext.grid.*',
    //'Ext.data.*',
    //'Ext.util.*',
    'Ext.ux.grid.GridHeaderFilters'//,
   // 'Ext.toolbar.Paging'
]);

Ext.onReady(function(){

    Ext.define('SearchConfigTableRow', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'lastprocessed', type: 'string'},
            {name: 'featureSourceName', type: 'string'},
            {name: 'featureTypeName', type: 'string'}
            
        ]
    });

    var searchConfigStore = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'SearchConfigTableRow',
        remoteSort: true,
        remoteFilter: true,
        proxy: {
            type: 'ajax',
            url: gridurl,
            reader: {
                type: 'json',
                root: 'gridrows',
                totalProperty: 'totalCount'
            },
            simpleSortMode: true
        },
        listeners: {
            load: function() {
                // Fix to apply filters
                Ext.getCmp('editGrid').doLayout();
            }
        }
    });

    var grid = Ext.create('Ext.grid.Panel', Ext.merge(defaultGridConfig, {
        id: 'editGrid',
        store: searchConfigStore,
        columns: [
            {
                id: 'name',
                text: "Naam",
                dataIndex: 'name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'featureSourceName',
                text: "Bronnaam",
                dataIndex: 'featureSourceName',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'lastprocessed',
                text: "Laatst ingeladen",
                dataIndex: 'lastprocessed',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                flex: 1,
                hideable: false,
                menuDisabled: true,
                renderer: function(value) {
                    return Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', value);
                },
                sortable: false
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: searchConfigStore,
            displayInfo: true,
            displayMsg: 'Zoekbronnen {0} - {1} of {2}',
            emptyMsg: "Geen zoekbronnen weer te geven"
        }),
        plugins: [ 
            Ext.create('Ext.ux.grid.GridHeaderFilters', {
                enableTooltip: false
            })
        ],
        renderTo: 'grid-container',
        listeners: {
            afterrender: function(grid) {
                // Default sort on first column
                grid.columns[0].setSortState('ASC');
            }
        }
    }));
    
});

function editObject(id){
    Ext.get('editFrame').dom.src = editurl + '&solrConfiguration=' + id;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', id));
    return false;
}