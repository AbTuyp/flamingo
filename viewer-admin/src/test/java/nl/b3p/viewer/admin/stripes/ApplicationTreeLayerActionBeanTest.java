/*
 * Copyright (C) 2016 B3Partners B.V.
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

import java.util.Iterator;
import java.util.List;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.util.TestUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Assert;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author meine
 */
public class ApplicationTreeLayerActionBeanTest extends TestUtil {

    private ApplicationTreeLayerActionBean instance = null;

    @Before
    public void setup() {
        initData(true);
        instance = new ApplicationTreeLayerActionBean();
        instance.setApplication(app);
    }

    @After
    public void tearDown() {
    }

    @Test
    public void testProcessAttributesTestOrder() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());

        JSONArray attributeOrder = new JSONArray();
        JSONArray attributesConfig = new JSONArray();
        
        JSONObject order2 = new JSONObject();
        order2.put("attribute_id", 2);
        order2.put("checked", true);
        order2.put("order", 0);
        JSONObject order3 = new JSONObject();
        order3.put("attribute_id", 3);
        order3.put("checked", true);
        order3.put("order", 1);
        JSONObject order4 = new JSONObject();
        order4.put("attribute_id", 4);
        order4.put("checked", true);
        order4.put("order", 2);
        JSONObject order5 = new JSONObject();
        order5.put("attribute_id", 5);
        order5.put("checked", true);
        order5.put("order", 3);
        JSONObject order6 = new JSONObject();
        order6.put("attribute_id", 6);
        order6.put("checked", true);
        order6.put("order", 4);
        JSONObject order9 = new JSONObject();
        order9.put("attribute_id", 9);
        order9.put("checked", true);
        order9.put("order", 5);
        JSONObject order8 = new JSONObject();
        order8.put("attribute_id", 8);
        order8.put("checked", true);
        order8.put("order", 6);
        JSONObject order1 = new JSONObject();
        order1.put("attribute_id", 1);
        order1.put("checked", true);
        order1.put("order", 7);
        JSONObject order7 = new JSONObject();
        order7.put("attribute_id", 7);
        order7.put("checked", true);
        order7.put("order", 8);
        
        attributeOrder.put(order2);
        attributeOrder.put(order3);
        attributeOrder.put(order4);
        attributeOrder.put(order5);
        attributeOrder.put(order6);
        attributeOrder.put(order9);
        attributeOrder.put(order8);
        attributeOrder.put(order1);
        attributeOrder.put(order7);

        List<ConfiguredAttribute> newOrder = instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);

        long[] attrOrder = {2, 3, 4, 5, 6, 9, 8, 1, 7};

        for (int i = 0; i < newOrder.size(); i++) {
            ConfiguredAttribute attr = newOrder.get(i);
            long id = attrOrder[i];
            Assert.assertTrue("Order incorrect", id == attr.getId());
        }
    }

    @Test
    public void testProcessAttributesTestVisible() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());

        JSONArray attributeOrder = new JSONArray();
        JSONArray attributesConfig = new JSONArray();
        
        JSONObject order = new JSONObject();
        order.put("attribute_id", 9);
        order.put("checked", true);
        
        attributeOrder.put(order);
        
        instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);

        boolean[] attrVisible = {false, false, false, false, false, false, false, false, true};

        for (int i = 0; i < attributes.size(); i++) {
            ConfiguredAttribute attr = attributes.get(i);
            boolean visible = attrVisible[i];
            Assert.assertTrue("Visibility incorrect", visible == attr.isVisible());

        }
    }

   // @Test
    public void testProcessAttributesPopulate() {
        assertNotNull(app);
        ApplicationLayer appLayer = entityManager.find(ApplicationLayer.class, 2L);
        List<ConfiguredAttribute> attributes = appLayer.getAttributes();
        assertEquals(9, attributes.size());
        JSONArray attributeOrder = new JSONArray();
        JSONArray attributesConfig = new JSONArray();
        JSONObject config = new JSONObject();
        config.put("allowValueListOnly", false);
        config.put("defaultValue", "");
        config.put("disableUserEdit", false);
        config.put("disallowNullValue", true);
        config.put("editAlias", "pietje");
        config.put("editHeight", "10");
        config.put("editable", true);
        config.put("editvalues", "");
        config.put("featureType", 14);
        config.put("filterable", false);
        config.put("id", 9);
        config.put("longname", "begroeid_terreindeel.status");
        config.put("name", "id");
        config.put("selectable", false);
        config.put("valueList", "static");
        attributesConfig.put(config);
        
        instance.processAttributes(entityManager, attributeOrder, attributesConfig, attributes);
        ConfiguredAttribute toCheck = null;
        for (ConfiguredAttribute next : attributes) {
            if(next.getId()== 9){
                toCheck = next;
                break;
            }
        }
        assertNotNull(toCheck);
        assertEquals(true, toCheck.isEditable());
        assertEquals(true, toCheck.getDisAllowNullValue());
        assertEquals("pietje", toCheck.getEditAlias());
        assertEquals("10", toCheck.getEditHeight());

    }
}
