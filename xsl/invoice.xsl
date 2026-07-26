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
    <xsl:attribute-set name="font-14">
        <xsl:attribute name="font-size">14pt</xsl:attribute>
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
        <xsl:attribute name="font-family">Helvetica</xsl:attribute>
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
                <fo:simple-page-master master-name="invoice" margin-left="0.5in" margin-top="0.5in" margin-right="0.25in" margin-bottom="0.5in" page-width="8.5in" page-height="11in">
                    <fo:region-body margin-top="1.25in" margin-bottom="0.5in"/>
                    <fo:region-before extent="1.25in"/> 
                    <fo:region-after extent="0.5in" display-align="after"/>
                    
                </fo:simple-page-master>
                
                
            </fo:layout-master-set>
            
            <fo:page-sequence master-reference="invoice">
                
                <fo:static-content flow-name="xsl-region-before">
                    
                    <fo:block text-align="center" space-after="0.1in">
                        <fo:external-graphic
                            src="url('file:/home/civilengineer_io/apps/masterserver/uploads/images/geotechlogo.png')"
                            content-width="7.5in"
                            content-height="1.25in"
                            scaling="non-uniform"
                            border="none"/>
                    </fo:block>
                    
                   
                    
                </fo:static-content>
                
                
                <fo:static-content flow-name="xsl-region-after">
                    
                    <fo:block
                        xsl:use-attribute-sets="alignRight generalFont font-14">
                        Page <fo:page-number/> of <fo:page-number-citation-last ref-id="last-page"/>
                    </fo:block>
                  
                </fo:static-content>
                
                
                <fo:flow flow-name="xsl-region-body">
                    
                   <fo:block-container xsl:use-attribute-sets="marginTop25">
                       <fo:block xsl:use-attribute-sets="generalFont font-16 alignCenter">Invoice for Geotechnical Services</fo:block>
                   </fo:block-container> 
                    
                    <fo:block-container xsl:use-attribute-sets="marginTop25">
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Client/Contact"/></fo:block>
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Client/Address"/></fo:block>
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Client/City"/>,<fo:inline>&#160;</fo:inline><xsl:value-of select="invoice/Client/State"/> <fo:inline>&#160;</fo:inline> <xsl:value-of select="invoice/Client/Zip"/></fo:block>
                    </fo:block-container> 
                    
                    <fo:block-container xsl:use-attribute-sets="marginTop25">
                        <fo:block xsl:use-attribute-sets="generalFont font-16">Project Number <fo:inline>&#160;</fo:inline>  <xsl:value-of select="invoice/Project/projectnumber"/></fo:block>
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Project/Title"/></fo:block>
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Project/address"/></fo:block>
                        <fo:block xsl:use-attribute-sets="generalFont font-16"><xsl:value-of select="invoice/Project/city"/>,<fo:inline>&#160;</fo:inline>CA</fo:block>
                    </fo:block-container> 
                    
                    <fo:block-container xsl:use-attribute-sets="marginTop25">
                        <fo:table
                            table-layout="fixed"
                            width="100%"
                            border-collapse="collapse">
                            
                            <!-- Columns -->
                            <fo:table-column column-width="1.25in"/>
                            <fo:table-column column-width="3.75in"/>
                            <fo:table-column column-width="1.5in"/>
                            <fo:table-column column-width="1.0in"/>
                            
                            <!-- Repeating Header -->
                            <fo:table-header>
                                <fo:table-row keep-together.within-page="always">
                                    
                                    <fo:table-cell
                                        border="0.5pt solid black"
                                        padding="4pt"
                                        display-align="center">
                                        <fo:block
                                            xsl:use-attribute-sets="font-14 generalFont alignCenter boldFont">
                                            Date
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell
                                        border="0.5pt solid black"
                                        padding="4pt"
                                        display-align="center">
                                        <fo:block
                                            xsl:use-attribute-sets="font-14 generalFont alignCenter boldFont">
                                            Description
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell
                                        border="0.5pt solid black"
                                        padding="4pt"
                                        display-align="center">
                                        <fo:block
                                            xsl:use-attribute-sets="font-14 generalFont alignCenter boldFont">
                                            Quantity @ $/Unit
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell
                                        border="0.5pt solid black"
                                        padding="4pt"
                                        display-align="center">
                                        <fo:block
                                            xsl:use-attribute-sets="font-14 generalFont alignCenter boldFont">
                                            Amount $
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                </fo:table-row>
                            </fo:table-header>
                            
                            <!-- Table Body -->
                            <fo:table-body>
                                
                                <xsl:for-each select="invoice/Invoice/Items/*">
                                  
                                  
                                
                                <!-- Example Row -->
                                    <fo:table-row>
                                        
                                        <!-- Date -->
                                        <fo:table-cell padding="3pt">
                                            <fo:block  xsl:use-attribute-sets="font-14 generalFont alignCenter">
                                                <xsl:value-of select="Date"/>
                                            </fo:block>
                                        </fo:table-cell>
                                        
                                        <!-- Description -->
                                        <fo:table-cell padding="3pt">
                                            <fo:block  xsl:use-attribute-sets="font-14 generalFont alignCenter">
                                                <xsl:value-of select="Description"/>
                                            </fo:block>
                                        </fo:table-cell>
                                        
                                        <!-- Quantity / Rate -->
                                        <fo:table-cell padding="3pt">
                                            <fo:block  xsl:use-attribute-sets="font-14 generalFont alignRight">
                                                
                                                <xsl:choose>
                                                    
                                                    <xsl:when test="self::Labor">
                                                        <xsl:value-of select="Hours"/>
                                                        <xsl:text> @ $</xsl:text>
                                                        <xsl:value-of select="Rate"/>/Hr
                                                    </xsl:when>
                                                    
                                                    <xsl:when test="self::Cost">
                                                        <xsl:value-of select="Quantity"/>
                                                        <xsl:text> @ $</xsl:text>
                                                        <xsl:value-of select="UnitCost"/>/
                                                        <xsl:value-of select="Unit"/>
                                                    </xsl:when>
                                                    
                                                </xsl:choose>
                                                
                                            </fo:block>
                                        </fo:table-cell>
                                        
                                        <!-- Amount -->
                                        <fo:table-cell padding="3pt">
                                            <fo:block  xsl:use-attribute-sets="font-14 generalFont alignRight">
                                                $<xsl:value-of select="Total"/>
                                            </fo:block>
                                        </fo:table-cell>
                                        
                                    </fo:table-row>
                                    
                                </xsl:for-each>
                                
                            </fo:table-body>
                            
                        </fo:table>
                        
                        
                    </fo:block-container>
                    
                    <fo:block-container xsl:use-attribute-sets="marginTop25">
                        
                        <fo:table table-layout="fixed" width="100%">
                            <fo:table-column column-width="50%"/>
                            <fo:table-column column-width="50%"/>
                            
                            <fo:table-body>
                                <fo:table-row>
                                    
                                    <fo:table-cell>
                                        <fo:block xsl:use-attribute-sets="font-14 generalFont boldFont">
                                            <fo:inline>Status: </fo:inline>
                                            <xsl:value-of select="invoice/Invoice/PaymentStatus"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                    <fo:table-cell>
                                        <fo:block xsl:use-attribute-sets="font-14 generalFont boldFont alignRight">
                                            <fo:inline>Date Paid: </fo:inline>
                                            <xsl:value-of select="invoice/Invoice/DatePaid"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    
                                </fo:table-row>
                            </fo:table-body>
                        </fo:table>
                    </fo:block-container>
                    <fo:block id="last-page"/>
                </fo:flow>
                
            </fo:page-sequence>
            
        </fo:root>
        
    </xsl:template>
    
</xsl:stylesheet>
