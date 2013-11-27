/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import java.io.StringReader;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.web.stripes.ErrorMessageResolution;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/applicationstartmap/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.APPLICATION_ADMIN}) 
public class ApplicationStartMapActionBean extends ApplicationActionBean {

    private static final String JSP = "/WEB-INF/jsp/application/applicationStartMap.jsp";
    
    @Validate
    private String selectedContent;
    private JSONArray jsonContent;
    
    @Validate
    private String contentToBeSelected;
    
    @Validate
    private String checkedLayersString;
    private JSONArray jsonCheckedLayers;
    //private List<Long> checkedLayers = new ArrayList();
    
    private JSONArray allCheckedLayers = new JSONArray();
    
    @Validate
    private String nodeId;
    @Validate
    private String levelId;
    private Level rootlevel;

    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution view() throws JSONException {
        if (application == null) {
            getContext().getMessages().add(new SimpleError("Er moet eerst een bestaande applicatie geactiveerd of een nieuwe applicatie gemaakt worden."));
            return new ForwardResolution("/WEB-INF/jsp/application/chooseApplication.jsp");
        } else {
            rootlevel = application.getRoot();
            getCheckedLayerList(allCheckedLayers, rootlevel);
        }

        return new ForwardResolution(JSP);
    }
    
    public Resolution save() throws JSONException {
        rootlevel = application.getRoot();
        
        jsonContent = new JSONArray(selectedContent);
        jsonCheckedLayers = new JSONArray(checkedLayersString);
        
        
        walkAppTreeForSave(rootlevel);
        
        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage("Het startkaartbeeld is opgeslagen"));
        
        getCheckedLayerList(allCheckedLayers, rootlevel);
        
        return new ForwardResolution(JSP);
    }
    
    public Resolution canContentBeSelected() {
        try {
            jsonContent = new JSONArray(selectedContent);
            
            if(jsonContent.length() == 0) {
                JSONObject obj = new JSONObject();
                obj.put("result", true);
                return new StreamingResolution("application/json", new StringReader(obj.toString()));
            }
            
            JSONObject o = new JSONObject(contentToBeSelected);        

            Boolean result = true;
            String message = null;

            String id = o.getString("id");
            if(o.get("type").equals("layer")) {
                
                message = "Kaartlagen kunnen niet los worden geselecteerd, alleen als onderdeel van een kaart of kaartlaaggroep";
                result = false;
                /*
                ApplicationLayer appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, new Long(id));
                if(appLayer == null) {
                    message = "Kaartlaag met id " + id + " is onbekend!";
                    result = false;
                } else {
                    /* An appLayer can not be selected if:
                     * - selectedContent contains the appLayer
                     * - the appLayer is a layer of any level or its children in selectedContent 
                     * /

                    for(int i = 0; i < jsonContent.length(); i++) {
                        JSONObject content = jsonContent.getJSONObject(i);

                        if(content.getString("type").equals("layer")) {
                            if(id.equals(content.getString("id"))) {
                                result = false;
                                message = "Kaartlaag is al geselecteerd";
                                break;
                            }
                        } else {
                            Level l = Stripersist.getEntityManager().find(Level.class, new Long(content.getString("id")));
                            if(l != null) {
                                if(l.containsLayerInSubtree(appLayer)) {
                                    result = false;
                                    message = "Kaartlaag is al geselecteerd als onderdeel van een niveau";
                                    break;
                                }
                            }
                        }
                    }
                }*/
            } else {
                Level level = Stripersist.getEntityManager().find(Level.class, new Long(id));
                if(level == null) {
                    result = false;
                    message = "Niveau met id " + id + " is onbekend!";
                } else {
                    
                    if(level.getLayers().isEmpty()) {
                        message = "Niveau is geen kaart";
                        result = false;
                        
                    } else {
                        /* A level can not be selected if:
                        * any level in selectedContent is the level is a sublevel of the level
                        * any level in selectedContent is a parent (recursive) of the level
                        */
                        for(int i = 0; i < jsonContent.length(); i++) {
                            JSONObject content = jsonContent.getJSONObject(i);

                            if(content.getString("type").equals("level")) {
                                if(id.equals(content.getString("id"))) {
                                    result = false;
                                    message = "Niveau is al geselecteerd";
                                    break;
                                }

                                Level l = Stripersist.getEntityManager().find(Level.class, new Long(content.getString("id")));
                                if(l != null) {
                                    if(l.containsLevelInSubtree(level)) {
                                        result = false;
                                        message = "Niveau kan niet worden geselecteerd omdat een bovenliggend niveau al geselecteerd is";
                                        break;
                                    }
                                    if(l.isInSubtreeOf(level)) {
                                        result = false;
                                        message = "Niveau kan niet worden geselecteerd omdat een subniveau al geselecteerd is";
                                        break;
                                    }
                                }
                            } else {
                                ApplicationLayer appLayer = Stripersist.getEntityManager().find(ApplicationLayer.class, new Long(content.getString("id")));
                                if(level.containsLayerInSubtree(appLayer)) {
                                    result = false;
                                    message = "Niveau kan niet worden geselecteerd omdat een kaartlaag uit dit (of onderliggend) niveau al is geselecteerd";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            JSONObject obj = new JSONObject();
            obj.put("result", result);
            obj.put("message", message);
            return new StreamingResolution("application/json", new StringReader(obj.toString()));

        } catch(Exception e) {
            return new ErrorMessageResolution("Exception " + e.getClass() + ": " + e.getMessage());
        }
    }
    
    private void walkAppTreeForSave(Level l) throws JSONException{ 
        l.setSelectedIndex(getSelectedContentIndex(l));
        
        for(ApplicationLayer al: l.getLayers()) {
            al.setSelectedIndex(getSelectedContentIndex(al));
            al.setChecked(getCheckedForLayerId(al.getId()));
        }
        
        for(Level child: l.getChildren()) {
            walkAppTreeForSave(child);
        }
    }
    
    private boolean getCheckedForLayerId(Long levelid) throws JSONException {
        for(int i = 0; i < jsonCheckedLayers.length(); i++){
            if(levelid.equals(new Long(jsonCheckedLayers.getInt(i)))) {
                return true;
            }
        }
        return false;
    }
    
    private Integer getSelectedContentIndex(Level l) throws JSONException{
        Integer index = null;
        
        for(int i = 0; i < jsonContent.length(); i++){
            JSONObject js = jsonContent.getJSONObject(i);
            String id = js.get("id").toString();
            String type = js.get("type").toString();
            if(id.equals(l.getId().toString()) && type.equals("level")){
                index = i;
            }
        }
        
        return index;
    }
    
    private Integer getSelectedContentIndex(ApplicationLayer al) throws JSONException{
        Integer index = null;
        
        for(int i = 0; i < jsonContent.length(); i++){
            JSONObject js = jsonContent.getJSONObject(i);
            String id = js.get("id").toString();
            String type = js.get("type").toString();
            if(id.equals(al.getId().toString()) && type.equals("layer")){
                index = i;
            }
        }
        
        return index;
    }

    public Resolution loadApplicationTree() throws JSONException {

        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();

        if (!nodeId.equals("n")) {

            String type = nodeId.substring(0, 1);
            int id = Integer.parseInt(nodeId.substring(1));
            if (type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                List<Level> levels = l.getChildren();
                Collections.sort(levels);
                for (Level sub : levels) {
                    JSONObject j = new JSONObject();
                    j.put("id", "n" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "level");
                    j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                    if (sub.getParent() != null) {
                        j.put("parentid", sub.getParent().getId());
                    }
                    children.put(j);
                }

                for (ApplicationLayer layer : l.getLayers()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + layer.getId());
                    j.put("name", layer.getDisplayName());
                    j.put("type", "layer");
                    j.put("isLeaf", true);
                    j.put("parentid", nodeId);
                    children.put(j);
                }
            }
        }

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        };
    }

    public Resolution loadSelectedLayers() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();

        final JSONArray children = new JSONArray();
        
        rootlevel = application.getRoot();

        if(levelId != null && levelId.substring(1).equals(rootlevel.getId().toString())){
            List selectedObjects = new ArrayList();
            walkAppTreeForStartMap(selectedObjects, rootlevel);

            Collections.sort(selectedObjects, new Comparator() {

                @Override
                public int compare(Object lhs, Object rhs) {
                    Integer lhsIndex, rhsIndex;
                    if(lhs instanceof Level) {
                        lhsIndex = ((Level)lhs).getSelectedIndex();
                    } else {
                        lhsIndex = ((ApplicationLayer)lhs).getSelectedIndex();
                    }
                    if(rhs instanceof Level) {
                        rhsIndex = ((Level)rhs).getSelectedIndex();
                    } else {
                        rhsIndex = ((ApplicationLayer)rhs).getSelectedIndex();
                    }
                    return lhsIndex.compareTo(rhsIndex);
                }
            });

            if(selectedObjects != null){
                for (Iterator it = selectedObjects.iterator(); it.hasNext();) {
                    Object map = it.next();
                    if(map instanceof ApplicationLayer){
                        ApplicationLayer layer = (ApplicationLayer) map;

                        JSONObject j = new JSONObject();
                        j.put("id", "s" + layer.getId());
                        j.put("name", layer.getDisplayName());
                        j.put("type", "layer");
                        j.put("isLeaf", true);
                        j.put("parentid", "");
                        j.put("checked", layer.isChecked());
                        children.put(j);
                    }else if(map instanceof Level){
                        Level level = (Level) map;
                        
                        JSONArray checked = new JSONArray();
                        getCheckedLayerList(checked, level);

                        JSONObject j = new JSONObject();
                        j.put("id", "n" + level.getId());
                        j.put("name", level.getName());
                        j.put("type", "level");
                        j.put("isLeaf", level.getChildren().isEmpty() && level.getLayers().isEmpty());
                        j.put("parentid", "");
                        j.put("checkedlayers", checked);
                        // j.put("checked", false);
                        children.put(j);
                    }
                }
            }
        }else{
            String type = levelId.substring(0, 1);
            int id = Integer.parseInt(levelId.substring(1));
            if (type.equals("n")) {
                Level l = em.find(Level.class, new Long(id));
                for (Level sub : l.getChildren()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "n" + sub.getId());
                    j.put("name", sub.getName());
                    j.put("type", "level");
                    j.put("isLeaf", sub.getChildren().isEmpty() && sub.getLayers().isEmpty());
                    if (sub.getParent() != null) {
                        j.put("parentid", sub.getParent().getId());
                    }
                    // j.put("checked", false);
                    children.put(j);
                }

                for (ApplicationLayer layer : l.getLayers()) {
                    JSONObject j = new JSONObject();
                    j.put("id", "s" + layer.getId());
                    j.put("name", layer.getDisplayName());
                    j.put("type", "layer");
                    j.put("isLeaf", true);
                    j.put("parentid", levelId);
                    j.put("checked", layer.isChecked());
                    children.put(j);
                }
            }
        }

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(children.toString());
            }
        };
    }
    
    private static void walkAppTreeForStartMap(List selectedContent, Level l){       
        if(l.getSelectedIndex() != null) {
            selectedContent.add(l);
        }
        
        for(ApplicationLayer al: l.getLayers()) {
            
            if(al.getSelectedIndex() != null) {
                selectedContent.add(al);
            }
        }
        
        for(Level child: l.getChildren()) {
            walkAppTreeForStartMap(selectedContent, child);
        }
    }
    
    private static void getCheckedLayerList(JSONArray layers, Level l) throws JSONException{
        for(ApplicationLayer al: l.getLayers()) {
            if(al.isChecked()) {
                layers.put(al.getId());
            }
        }
        for(Level child: l.getChildren()) {
            getCheckedLayerList(layers, child);
        }
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">

    public String getCheckedLayersString() {
        return checkedLayersString;
    }

    public void setCheckedLayersString(String checkedLayersString) {
        this.checkedLayersString = checkedLayersString;
    }

    public String getSelectedContent() {
        return selectedContent;
    }

    public void setSelectedContent(String selectedContent) {
        this.selectedContent = selectedContent;
    }

    public Level getRootlevel() {
        return rootlevel;
    }

    public void setRootlevel(Level rootlevel) {
        this.rootlevel = rootlevel;
    }

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public JSONArray getAllCheckedLayers() {
        return allCheckedLayers;
    }

    public void setAllCheckedLayers(JSONArray allCheckedLayers) {
        this.allCheckedLayers = allCheckedLayers;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getContentToBeSelected() {
        return contentToBeSelected;
    }

    public void setContentToBeSelected(String contentToBeSelected) {
        this.contentToBeSelected = contentToBeSelected;
    }
    //</editor-fold>
}
