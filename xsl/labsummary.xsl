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
                    <fo:simple-page-master master-name="labsummary" margin-left="0.5in" margin-top="0.5in" margin-right="0.25in" margin-bottom="0.5in" page-width="8.5in" page-height="11in">
                    <fo:region-body margin-top="1.5in" margin-bottom="0.5in"/>
                    <fo:region-before extent="1.0in"/> 
                    <fo:region-after extent="0.5in"/>
                    
                </fo:simple-page-master>
                
                
            </fo:layout-master-set>
            
            <fo:page-sequence master-reference="labsummary">
                
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
                                       Project Number <xsl:value-of select="labsummary/projectnumber"/>
                                    </fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell>
                                    <fo:block xsl:use-attribute-sets="font-12"
                                        line-height="0.25in"
                                        text-align="right"
                                        >
                                        
                                       <xsl:value-of select="labsummary/title"/>
                                        
                                    </fo:block>
                                </fo:table-cell>
                                
                            </fo:table-row>
                            
                            <!-- ===== Row 2 ===== -->
                            <fo:table-row height="0.25in">
                                
                                <fo:table-cell>
                                    <fo:block line-height="0.25in">
                                        &#160;
                                    </fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell>
                                    <fo:block
                                        line-height="0.25in"
                                        text-align="right"
                                        >
                                        <xsl:value-of select="labsummary/projectaddress"/>,&#160;<xsl:value-of select="labsummary/projectcity"/>
                                    </fo:block>
                                </fo:table-cell>
                                
                            </fo:table-row>
                            
                        </fo:table-body>
                    </fo:table>
                    
                    <fo:block-container height="0.5in" display-align="center">
                        <fo:block xsl:use-attribute-sets="alignCenter font-14 boldFont">
                            Appendix A - Lab Summary Table
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
                        
                        Appendix A - <fo:page-number/>
                        
                    </fo:block>
                </fo:static-content>
                
                
                <fo:flow flow-name="xsl-region-body">
                    
                    <fo:table table-layout="fixed" width="100%">
                        <!-- Column widths -->
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="1.75in"/>
                        
                        <fo:table-header>
                            
                            <!-- ====================== -->
                            <!-- HEADER ROW 1 (0.75 in) -->
                            <!-- ====================== -->
                            
                            <fo:table-row height="0.25in">
                                
                                <!-- Row-spanning cells (not part of merges) -->
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid black" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Sample No</fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid black" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Depth (ft)</fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid black" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Dry Density (pcf)</fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid black" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Moisture Content % </fo:block>
                                </fo:table-cell>
                                
                                <!-- Span 5 & 6 → Atterberg Limits -->
                                <fo:table-cell number-columns-spanned="2" border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Atterberg Limits</fo:block>
                                </fo:table-cell>
                                
                                <!-- Span 7 & 8 → Unconfined Compression -->
                                <fo:table-cell number-columns-spanned="2" border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Unconfined Compression</fo:block>
                                </fo:table-cell>
                                
                                <!-- Row-spanning column 9 -->
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid black" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Sieve Analysis</fo:block>
                                </fo:table-cell>
                                
                            </fo:table-row>
                            
                            <!-- ====================== -->
                            <!-- HEADER ROW 2 (normal)  -->
                            <!-- ====================== -->
                            
                            <fo:table-row height="0.5in">
                                
                                <!-- These two cells sit under the 5–6 span -->
                                <fo:table-cell border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Liquid Limit %</fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Plastic Index</fo:block>
                                </fo:table-cell>
                                
                                <!-- These two cells sit under the 7–8 span -->
                                <fo:table-cell border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Strength (psf)</fo:block>
                                </fo:table-cell>
                                
                                <fo:table-cell border="0.5pt solid black">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10">Strain %</fo:block>
                                </fo:table-cell>
                                
                            </fo:table-row>
                            
                        </fo:table-header>
                        
                        <!-- ====================== -->
                        <!--         BODY           -->
                        <!-- ====================== -->
                        <fo:table-body>
                            <xsl:for-each select="labsummary/sample">
                            <fo:table-row height="0.35in">
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="sampleno"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center" ><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="depth"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="dryden"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="moist"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="ll"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="pi"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="un"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="strain"/></fo:block></fo:table-cell>
                                <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center"><fo:block xsl:use-attribute-sets="font-10"><xsl:value-of select="sieve"/></fo:block></fo:table-cell>
                            </fo:table-row>
                            </xsl:for-each>
                        </fo:table-body>
                        
                    </fo:table>
                    
                    
                </fo:flow>
                
            </fo:page-sequence>
            
        </fo:root>
        
    </xsl:template>
    
</xsl:stylesheet>
