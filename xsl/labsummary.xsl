<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0">
    <xsl:attribute-set name="font-14">
        <xsl:attribute name="font-size">12pt</xsl:attribute>
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
        <xsl:attribute name="font-size">10pt</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="font-10">
        <xsl:attribute name="font-size">10pt</xsl:attribute>
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
        <xsl:attribute name="font-family">Times New Roman</xsl:attribute>
    </xsl:attribute-set>
    <xsl:attribute-set name="tableFont">
        <xsl:attribute name="font-family">Times New Roman</xsl:attribute>
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
    <xsl:param name="appendix-letter" select="'A'"/>
    <xsl:template match="/">
        <fo:root font-family="Times New Roman" font-size="10pt" font-weight="normal" color="#000000">
            <fo:layout-master-set>
                <fo:simple-page-master master-name="labsummary" margin-left="0.5in" margin-top="0.5in" margin-right="0.25in" margin-bottom="0.5in" page-width="8.5in" page-height="11in">
                    <fo:region-body margin-top="1.0in" margin-bottom="0.55in"/>
                    <fo:region-before extent="0.85in"/>
                    <fo:region-after extent="0.45in"/>
                </fo:simple-page-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="labsummary" format="1" initial-page-number="1" force-page-count="no-force">
                <fo:static-content flow-name="xsl-region-before">
                    <fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="10pt" color="#000000" border-bottom="0.75pt solid #000000" padding-bottom="4pt">
                        <fo:table-column column-width="1.25in"/>
                        <fo:table-column column-width="5in"/>
                        <fo:table-column column-width="1.50in"/>
                        <fo:table-body>
                            <fo:table-row>
                                <fo:table-cell>
                                    <fo:block text-align="left">
                                        Proj. No.
                                        <xsl:value-of select="/labsummary/projectnumber"/>
                                    </fo:block>
                                </fo:table-cell>
                                <fo:table-cell>
                                    <fo:block text-align="center">
                                        <xsl:choose>
                                            <xsl:when test="normalize-space(/labsummary/reporttitle)">
                                                <xsl:value-of select="/labsummary/reporttitle"/>
                                            </xsl:when>
                                            <xsl:otherwise>Laboratory Test Summary</xsl:otherwise>
                                        </xsl:choose>
                                        <xsl:if test="normalize-space(/labsummary/title) or normalize-space(/labsummary/projecttitle)">
                                            <xsl:text> / </xsl:text>
                                            <xsl:choose>
                                                <xsl:when test="normalize-space(/labsummary/projecttitle)">
                                                    <xsl:value-of select="/labsummary/projecttitle"/>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:value-of select="/labsummary/title"/>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:if>
                                    </fo:block>
                                </fo:table-cell>
                                <fo:table-cell>
                                    <fo:block text-align="right">
                                        <xsl:choose>
                                            <xsl:when test="normalize-space(/labsummary/datereport)">
                                                <xsl:value-of select="/labsummary/datereport"/>
                                            </xsl:when>
                                            <xsl:when test="normalize-space(/labsummary/reportdate)">
                                                <xsl:value-of select="/labsummary/reportdate"/>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <xsl:value-of select="/labsummary/date"/>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </fo:block>
                                </fo:table-cell>
                            </fo:table-row>
                            <fo:table-row>
                                <fo:table-cell number-columns-spanned="3" padding-bottom="5pt">
                                    <fo:block text-align="center">
                                        <xsl:value-of select="/labsummary/projectaddress"/>
                                        <xsl:if test="normalize-space(/labsummary/projectaddress) and normalize-space(/labsummary/projectcity)">
                                            <xsl:text> </xsl:text>
                                        </xsl:if>
                                        <xsl:value-of select="/labsummary/projectcity"/>
                                        <xsl:if test="normalize-space(/labsummary/projectcity) and not(normalize-space(/labsummary/projectstate))">
                                            <xsl:text>, CA</xsl:text>
                                        </xsl:if>
                                        <xsl:if test="normalize-space(/labsummary/projectstate)">
                                            <xsl:text>, </xsl:text>
                                            <xsl:value-of select="/labsummary/projectstate"/>
                                        </xsl:if>
                                    </fo:block>
                                </fo:table-cell>
                            </fo:table-row>
                        </fo:table-body>
                    </fo:table>
                </fo:static-content>
                <fo:static-content flow-name="xsl-region-after">
                    <fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="10pt" color="#000000" border-top="0.75pt solid #000000" padding-top="4pt">
                        <fo:table-column column-width="proportional-column-width(1)"/>
                        <fo:table-column column-width="proportional-column-width(1)"/>
                        <fo:table-column column-width="proportional-column-width(1)"/>
                        <fo:table-body>
                            <fo:table-row>
                                <fo:table-cell padding-top="5pt">
                                    <fo:block text-align="left" font-weight="bold" font-style="italic">GFK &amp; ASSOCIATES, INC</fo:block>
                                </fo:table-cell>
                                <fo:table-cell padding-top="5pt">
                                    <fo:block text-align="center" font-weight="bold" font-style="italic">Geotechnical Consultants</fo:block>
                                </fo:table-cell>
                                <fo:table-cell padding-top="5pt">
                                    <fo:block text-align="right" font-weight="bold">
                                        Page
                                        <xsl:value-of select="$appendix-letter"/>
                                        <fo:page-number/>
                                    </fo:block>
                                </fo:table-cell>
                            </fo:table-row>
                        </fo:table-body>
                    </fo:table>
                </fo:static-content>
                <fo:flow flow-name="xsl-region-body">
                    <fo:block font-family="Times New Roman" font-size="12pt" font-weight="bold" text-align="center" space-before="4pt" space-after="14pt" keep-with-next.within-page="always" text-decoration="underline">SUMMARY OF LABORATORY TEST RESULTS</fo:block>
                    <fo:table table-layout="fixed" width="100%" border-collapse="collapse">
                        <!--  Column widths  -->
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="0.75in"/>
                        <fo:table-column column-width="1.75in"/>
                        <fo:table-header font-weight="bold" font-family="Times New Roman" font-size="10pt" color="#000000">
                            <!--  ======================  -->
                            <!--  HEADER ROW 1 (0.75 in)  -->
                            <!--  ======================  -->
                            <fo:table-row height="0.25in">
                                <!--  Row-spanning cells (not part of merges)  -->
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-left="3pt double #000000" border-bottom="3pt double #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Sample No</fo:block>
                                </fo:table-cell>
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Depth (ft)</fo:block>
                                </fo:table-cell>
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Dry Density (pcf)</fo:block>
                                </fo:table-cell>
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Moisture Content % </fo:block>
                                </fo:table-cell>
                                <!--  Span 5 & 6 → Atterberg Limits  -->
                                <fo:table-cell number-columns-spanned="2" border="0.5pt solid #000000" border-top="3pt double #000000" display-align="center" border-bottom="0.5pt solid #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Atterberg Limits</fo:block>
                                </fo:table-cell>
                                <!--  Span 7 & 8 → Unconfined Compression  -->
                                <fo:table-cell number-columns-spanned="2" border="0.5pt solid #000000" border-top="3pt double #000000" display-align="center" border-bottom="0.5pt solid #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Unconfined Compression</fo:block>
                                </fo:table-cell>
                                <!--  Row-spanning column 9  -->
                                <fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-right="3pt double #000000" border-bottom="3pt double #000000">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Sieve Analysis</fo:block>
                                </fo:table-cell>
                            </fo:table-row>
                            <!--  ======================  -->
                            <!--  HEADER ROW 2 (normal)   -->
                            <!--  ======================  -->
                            <fo:table-row height="0.5in">
                                <!--  These two cells sit under the 5–6 span  -->
                                <fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Liquid Limit %</fo:block>
                                </fo:table-cell>
                                <fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Plastic Index</fo:block>
                                </fo:table-cell>
                                <!--  These two cells sit under the 7–8 span  -->
                                <fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Strength (psf)</fo:block>
                                </fo:table-cell>
                                <fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
                                    <fo:block text-align="center" xsl:use-attribute-sets="font-10" font-weight="bold" line-height="12pt">Strain %</fo:block>
                                </fo:table-cell>
                            </fo:table-row>
                        </fo:table-header>
                        <!--  ======================  -->
                        <!--          BODY            -->
                        <!--  ======================  -->
                        <fo:table-body>
                            <xsl:for-each select="labsummary/sample">
                                <fo:table-row height="0.35in">
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="sampleno"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="depth"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="dryden"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="moist"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="ll"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="pi"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="un"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="strain"/>
                                        </fo:block>
                                    </fo:table-cell>
                                    <fo:table-cell border="0.5pt solid black" xsl:use-attribute-sets="alignCenter" display-align="center">
                                        <fo:block xsl:use-attribute-sets="font-10">
                                            <xsl:value-of select="sieve"/>
                                        </fo:block>
                                    </fo:table-cell>
                                </fo:table-row>
                            </xsl:for-each>
                        </fo:table-body>
                    </fo:table>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>
</xsl:stylesheet>