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
package nl.b3p.viewer.stripes;

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.io.WKTReader;
import net.sourceforge.stripes.action.ActionBean;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DataUtilities;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Transaction;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.identity.FeatureIdImpl;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.GeometryType;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.identity.FeatureId;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/feature/edit")
@StrictBinding
public class EditFeatureActionBean  implements ActionBean {
    private static final Log log = LogFactory.getLog(EditFeatureActionBean.class);
    
    private static final String FID = FeatureInfoActionBean.FID;
    
    private ActionBeanContext context;
    
    @Validate
    private Application application;
    
    @Validate
    private String feature;

    @Validate
    private ApplicationLayer appLayer;
    
    private Layer layer;
    private SimpleFeatureStore store;
    private JSONObject jsonFeature;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
    
    public String getFeature() {
        return feature;
    }
    
    public void setFeature(String feature) {
        this.feature = feature;
    }
    
    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }
    //</editor-fold>

    public Resolution edit() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;
    
        FeatureSource fs = null;
        try {
            do {
                if(appLayer == null) {
                    error = "App layer or service not found";
                    break;
                }
                if(!Authorizations.isAppLayerWriteAuthorized(application, appLayer, context.getRequest())) {
                    error = "U heeft geen rechten om deze kaartlaag te bewerken";
                    break;
                }
                layer = appLayer.getService().getLayer(appLayer.getLayerName());

                if(layer == null) {
                    error = "Layer not found";
                    break;
                }

                if(layer.getFeatureType() == null) {
                    error ="No feature type";
                    break;
                }

                fs = layer.getFeatureType().openGeoToolsFeatureSource();
                
                if(!(fs instanceof SimpleFeatureStore)) {
                    error = "Feature source does not support editing";
                    break;
                }
                store = (SimpleFeatureStore)fs;
                
                jsonFeature = new JSONObject(feature);
                String fid = jsonFeature.optString(FID, null);

                if(fid == null) {
                    json.put(FID, addNewFeature());
                } else {
                    editFeature(fid);
                    json.put(FID, fid);
                }
                
                json.put("success", Boolean.TRUE);
            } while(false);
        } catch(Exception e) {
            log.error(String.format("Exception editing feature", e));
            
            error = e.toString();
            if(e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        } finally {
            if(fs != null) {
                fs.getDataStore().dispose();
            }
        }
                
        if(error != null) {
            json.put("error", error);
            log.error("Returned error message editing feature: " + error);
        }      
        
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));            
    }
    
    private String addNewFeature() throws Exception {
        
        SimpleFeature f = DataUtilities.template(store.getSchema());

        Transaction transaction = new DefaultTransaction("create");
        store.setTransaction(transaction);
        
        for(AttributeDescriptor ad: store.getSchema().getAttributeDescriptors()) {
            if(ad.getType() instanceof GeometryType) {
                String wkt = jsonFeature.optString(ad.getLocalName(), null);
                Geometry g = null;
                if(wkt != null) {
                    g = new WKTReader().read(wkt);
                }
                f.setDefaultGeometry(g);
            } else {
                String v = jsonFeature.optString(ad.getLocalName());
                f.setAttribute(ad.getLocalName(), StringUtils.defaultIfBlank(v, null));
            }
        }      

        log.debug(String.format("Creating new feature in feature source source #%d: %s",
                layer.getFeatureType().getId(),
                f.toString()));

        try {
            List<FeatureId> ids = store.addFeatures(DataUtilities.collection(f));

            transaction.commit();
            return ids.get(0).getID();
        } catch (Exception e) {
            transaction.rollback();
            throw e;
        } finally {
            transaction.close();
        }               
    }
    
    private void editFeature(String fid) throws Exception {
        Transaction transaction = new DefaultTransaction("edit");
        store.setTransaction(transaction);

        FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
        Filter filter = ff.id(new FeatureIdImpl(fid));

        List<String> attributes = new ArrayList<String>();
        List values = new ArrayList();
        for(Iterator<String> it = jsonFeature.keys(); it.hasNext();) {
            String attribute = it.next();
            if(!FID.equals(attribute)) {
                
                AttributeDescriptor ad = store.getSchema().getDescriptor(attribute);
                
                if(ad != null) {
                    attributes.add(attribute);
                    
                    if(ad.getType() instanceof GeometryType) {
                        String wkt = jsonFeature.getString(ad.getLocalName());
                        Geometry g = null;
                        if(wkt != null) {
                            g = new WKTReader().read(wkt);
                        } 
                        values.add(g);
                    } else {
                        String v = jsonFeature.getString(attribute);
                        values.add(StringUtils.defaultIfBlank(v, null));                        
                    }
                } else {
                    log.warn(String.format("Attribute \"%s\" not in feature type; ignoring", attribute));
                }
            }
        }

        log.debug(String.format("Modifying feature source #%d fid=%s, attributes=%s, values=%s",
                layer.getFeatureType().getId(),
                fid,
                attributes.toString(),
                values.toString()));

        try {
            store.modifyFeatures(attributes.toArray(new String[] {}), values.toArray(), filter);

            transaction.commit();
        } catch (Exception e) {
            transaction.rollback();
            throw e;
        } finally {
            transaction.close();
        }                
    }
}
