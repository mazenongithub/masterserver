<?xml version="1.0" encoding="UTF-8"?> 
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:fo="http://www.w3.org/1999/XSL/Format">
    <xsl:attribute-set name="font-14">
        <xsl:attribute name="font-size">14pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-18">
        <xsl:attribute name="font-size">18pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-16">
        <xsl:attribute name="font-size">16pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-11">
        <xsl:attribute name="font-size">11pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-12">
        <xsl:attribute name="font-size">12.5pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-10">
        <xsl:attribute name="font-size">11pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="displayCenter">
        <xsl:attribute name="display-align">center</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="alignCenter">
        <xsl:attribute name="text-align">center</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="alignRight">
        <xsl:attribute name="text-align">right</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="marginLeft875">
        <xsl:attribute name="margin-left">8.75in</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="marginBottom25">
        <xsl:attribute name="margin-bottom">0.25in</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="marginTop25">
        <xsl:attribute name="margin-top">0.25in</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="generalFont">
        <xsl:attribute name="font-family">Calibri</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="tableFont">
        <xsl:attribute name="font-family">Arial</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="borderBottom">
        <xsl:attribute name="border-bottom">0.05in solid</xsl:attribute>
        <xsl:attribute name="border-bottom-color">#015486</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="boldFont">
        <xsl:attribute name="font-weight">bold</xsl:attribute>
        <xsl:attribute name="border-bottom-color">#015486</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="showBorder">
        <xsl:attribute name="border">medium solid</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="bluebackground">
        <xsl:attribute name="background-color">#85C4F9</xsl:attribute>
    </xsl:attribute-set>
    
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/">
        <fo:root>
            
            <fo:layout-master-set>
                <fo:simple-page-master master-name="fieldreport" margin-left="0.5in" margin-top="0.5in" margin-right="0.25in" margin-bottom="0.5in" page-width="8.5in" page-height="11in">
                    <fo:region-body margin-top="1.25in" margin-bottom="0.5in"/>
                    <fo:region-before extent="1.0in"/> 
                    <fo:region-after extent="0.5in"/>
                    
                </fo:simple-page-master>
                
                
            </fo:layout-master-set>
            
            <fo:page-sequence master-reference="fieldreport">
                
                <fo:static-content flow-name="xsl-region-before">
                    
                    <fo:table table-layout="fixed" width="7.75in" border-bottom="1pt solid black">
                        
                        <!-- Column widths -->
                        <fo:table-column column-width="4in"/>
                        <fo:table-column column-width="3.75in"/>
                        
                        <fo:table-body>
                            
                            <!-- ===== Row 1 ===== -->
                            <fo:table-row height="0.25in">
                                
                                <fo:table-cell>
                                    <fo:block line-height="0.25in" xsl:use-attribute-sets="font-12">
                                        Project Number <xsl:value-of select="fieldreport/projectnumber"/>
                                    </fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell>
                                    <fo:block xsl:use-attribute-sets="font-12"
                                        line-height="0.25in"
                                        text-align="right"
                                        >
                                        
                                        <xsl:value-of select="fieldreport/title"/>
                                        
                                    </fo:block>
                                </fo:table-cell>
                                
                            </fo:table-row>
                            
                            <!-- ===== Row 2 ===== -->
                            <fo:table-row height="0.25in">
                                
                                <fo:table-cell>
                                    <fo:block  xsl:use-attribute-sets="font-12" line-height="0.25in">
                                        <xsl:value-of select="fieldreport/datereport"/>
                                    </fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell>
                                    <fo:block
                                        line-height="0.25in"
                                        text-align="right"
                                        >
                                        <xsl:value-of select="fieldreport/address"/>,&#160;<xsl:value-of select="fieldreport/city"/>
                                    </fo:block>
                                </fo:table-cell>
                                
                                
                                                      
                            </fo:table-row>
                            
                        </fo:table-body>
                    </fo:table>
                    
                    <fo:block-container height="0.5in" display-align="center">
                        <fo:block xsl:use-attribute-sets="alignCenter font-14 boldFont">
                            GEOTECHNICAL FIELD REPORT
                        </fo:block>
                    </fo:block-container>
                    
                </fo:static-content>
                
                <fo:static-content flow-name="xsl-region-after">
                    <fo:block 
                        display-align="after"
                        border-top="0.5pt solid black"
                        padding-top="0.05in"
                        padding-bottom="0.1in"
                        text-align="right"
                        font-size="12pt"
                        padding-right="0.1in">
                        
                        Page  <fo:page-number/>
                        
                    </fo:block>
                </fo:static-content>
                
                <fo:flow flow-name="xsl-region-body">
                    
                    <fo:block xsl:use-attribute-sets="font-14"><xsl:value-of select="fieldreport/content"/></fo:block>
                    
                    
                    <xsl:if test="fieldreport/curves">
                        
                        <fo:block xsl:use-attribute-sets="font-14 alignCenter marginBottom25">Compaction Tests</fo:block>
                        
                        
                        <fo:table table-layout="fixed" width="100%" border-collapse="separate">
                            
                            <!-- Column widths -->
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="5in"/>
                            <fo:table-column column-width="1in"/>
                            <fo:table-column column-width="1in"/>
                            
                            <!-- Header -->
                            <fo:table-header>
                                <fo:table-row height="0.5in">
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Curve No.</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Description</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Max Density (pcf)</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Optimum Moisture % </fo:block>
                                    </fo:table-cell>
                                </fo:table-row>
                            </fo:table-header>
                            
                            <xsl:for-each select="fieldreport/curves/curve">
                                
                                <fo:table-body>
                                    <fo:table-row height="0.3in">
                                        <fo:table-cell border="0.5pt solid black" display-align="center">
                                            <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="curvenumber"/></fo:block>
                                        </fo:table-cell>
                                        
                                        <fo:table-cell border="0.5pt solid black" display-align="center">
                                            <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="description"/></fo:block>
                                        </fo:table-cell>
                                        
                                        <fo:table-cell border="0.5pt solid black" display-align="center">
                                            <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="maxden"/></fo:block>
                                        </fo:table-cell>
                                        
                                        <fo:table-cell border="0.5pt solid black" display-align="center">
                                            <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="moist"/></fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                </fo:table-body>
                                
                                
                            </xsl:for-each>
                            
                            <!-- (Optional) Body example -->
                         
                            
                        </fo:table>
                        
                        
                        <fo:table table-layout="fixed" width="100%" border-collapse="separate" xsl:use-attribute-sets="marginTop25">
                            
                            <!-- Column widths -->
                            <fo:table-column column-width="0.5in"/>
                            <fo:table-column column-width="0.5in"/>
                            <fo:table-column column-width="2in"/>
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="0.75in"/>
                            <fo:table-column column-width="0.5in"/>
                            <fo:table-column column-width="0.5in"/>
                            
                            <!-- Header -->
                            <fo:table-header>
                                <fo:table-row height="0.5in">
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Test No.</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">El.</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Lcoation</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Wet Density (pcf)</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Moisture (pcf)</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Dry Density (pcf)</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Moisture %</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Max Density (pcf)</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">%</fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center">Curve No.</fo:block>
                                    </fo:table-cell>
                                </fo:table-row>
                            </fo:table-header>
                            
                            <!-- First body row for you to fill in -->
                            <fo:table-body>
                                <xsl:for-each select="fieldreport/tests/test">
                                <fo:table-row>
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="testno"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10" text-align="center"><xsl:value-of select="elevation"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="location"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="wetpcf"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="moistpcf"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="dryden"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="moist"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="maxden"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell border="0.5pt solid black" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10"  text-align="center"><xsl:value-of select="relative"/></fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell xsl:use-attribute-sets="font-10"  border="0.5pt solid black" display-align="center">
                                        <fo:block text-align="center"><xsl:value-of select="curvenumber"/></fo:block>
                                    </fo:table-cell>
                                </fo:table-row>
                                    
                                </xsl:for-each>
                            </fo:table-body>
                            
                        </fo:table>
           
                    </xsl:if>
                    
                    
                    <xsl:if test="fieldreport/images">
                        
                        <xsl:for-each select="fieldreport/images/image">
                        
                        
                        <fo:block text-align="center" margin-top="0.25in" margin-bottom="0.25in">
                            
                            <!-- Image centered -->
                            <fo:external-graphic
                                src="{url}"
                                content-width="4.75in"
                                content-height="scale-to-fit"
                                scaling="uniform"
                                text-align="center"
                            />
                            
                            <!-- Caption centered under image -->
                            <fo:block 
                                width="6.5in"
                                text-align="center"
                                font-size="10pt"
                                margin-top="0.1in"
                                keep-with-previous="always"
                                >
                                <xsl:value-of select="caption"/>
                            </fo:block>
                            
                        </fo:block>
                            
                            </xsl:for-each>
                        
                    </xsl:if>
                    
                    
                </fo:flow>
                
            </fo:page-sequence>
            
            
            
            
            
        </fo:root>
        
        
    </xsl:template>
        
</xsl:stylesheet>
