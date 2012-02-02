/*
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
package nl.b3p.geotools.data.arcims;

import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;

/**
 *
 * @author matthijsln
 */
@XmlAccessorType(XmlAccessType.FIELD)
public class AxlServiceInfo implements AxlResponse {
    @XmlElement(name="PROPERTIES")
    AxlProperties properties;
    
    @XmlElement(name="LAYERINFO")
    List<AxlLayerInfo> layers;

    public List<AxlLayerInfo> getLayers() {
        return layers;
    }

    public void setLayers(List<AxlLayerInfo> layers) {
        this.layers = layers;
    }

    public AxlProperties getProperties() {
        return properties;
    }

    public void setProperties(AxlProperties properties) {
        this.properties = properties;
    }
}
