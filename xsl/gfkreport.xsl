<!-- 
    CivilEngineer.io / GFK report stylesheet
    XSLT 1.0 + XSL-FO, intended for Apache FOP.

    Expected XML structure:
      report/reporttitle, report/type, report/reportid, report/projectid,
      report/datereport, report/author, optional projecttitle/projectaddress/
      projectcity/clientname/consultant, and report/sections/section.

    Each section:
      section/title, section/content, section/subsections/section...
 -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0">
    <xsl:output method="xml" encoding="UTF-8" indent="yes"/>
    <xsl:param name="company-name" select="'civilengineer.io'"/>
    <xsl:param name="footer-text" select="'Engineering Report'"/>
    <xsl:template match="/">
        <fo:root
            font-family="Times New Roman"
            font-size="12pt"
            font-weight="normal"
            color="#000000">
            <fo:layout-master-set>
                <fo:simple-page-master
                    master-name="report-page"
                    page-width="8.5in"
                    page-height="11in"
                    margin-top="1in"
                    margin-bottom="1in"
                    margin-left="1in"
                    margin-right="1in">
                    
                    <fo:region-body
                        margin-top="0.55in"
                        margin-bottom="0.45in"/>
                    
                    <fo:region-before extent="0.55in"/>
                    <fo:region-after extent="0.35in"/>
                    
                </fo:simple-page-master>
            </fo:layout-master-set>
          

    <!-- Title Page -->
            <fo:page-sequence
                master-reference="report-page"
                initial-page-number="1"
                force-page-count="no-force"
                format="i">
                
                <fo:flow flow-name="xsl-region-body">
                    
                    <fo:block
                        space-before="1.25in"
                        text-align="center"
                        font-family="Times New Roman"
                        font-size="10pt"
                        color="#000000">
                        
                        <!-- Report Title -->
                        <fo:block
                            font-size="10pt"
                            font-weight="bold"
                            space-after="18pt">
                            
                            <xsl:value-of select="translate(/report/reporttitle,
                                'abcdefghijklmnopqrstuvwxyz',
                                'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                            
                        </fo:block>
                        
                        <!-- Project Information -->
                        <fo:block
                            font-size="10pt"
                            font-weight="bold"
                            space-after="0pt">
                            
                            <xsl:value-of select="translate(/report/projecttitle,
                                'abcdefghijklmnopqrstuvwxyz',
                                'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                            
                        </fo:block>
                        
                        <fo:block font-weight="bold">
                            
                            <xsl:value-of select="translate(/report/projectaddress,
                                'abcdefghijklmnopqrstuvwxyz',
                                'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                            
                        </fo:block>
                        
                        <fo:block font-weight="bold">
                            
                            <xsl:value-of select="translate(/report/projectcity,
                                'abcdefghijklmnopqrstuvwxyz',
                                'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>, CA
                            
                        </fo:block>
                        
                        <!-- Prepared For -->
                        <fo:block
                            space-before="0.35in"
                            font-weight="bold">
                            
                            Prepared for
                            
                        </fo:block>
                        
                        <fo:block
                            font-weight="bold"
                            space-after="0pt">
                            
                            <xsl:value-of select="translate(/report/client,
                                'abcdefghijklmnopqrstuvwxyz',
                                'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                            
                        </fo:block>
                        
                        <!-- Prepared By -->
                        <fo:block
                            space-before="1.75in"
                            font-weight="bold">
                            
                            By:
                            
                        </fo:block>
                        
                        <fo:block
                            font-weight="bold"
                            font-style="italic">
                            
                            GFK &amp; ASSOCIATES, INC
                            
                        </fo:block>
                        
                        <fo:block
                            font-weight="bold"
                            font-style="italic">
                            
                            Geotechnical Consultants
                            
                        </fo:block>
                        
                        <!-- Project Number -->
                        <fo:block
                            space-before="0.5in"
                            font-weight="bold">
                            
                            Proj No. <xsl:value-of select="/report/projectnumber"/>
                            
                        </fo:block>
                        
                        <!-- Report Date -->
                        <fo:block font-weight="bold">
                            
                            <xsl:value-of select="/report/datereport"/>
                            
                        </fo:block>
                        
                    </fo:block>
                    
                </fo:flow>
                
            </fo:page-sequence>
    
    <!-- TABLE OF CONTENTS -->
            <fo:page-sequence
                master-reference="report-page"
                initial-page-number="1"
                format="i">
                
                <!-- Reusable Header -->
                <xsl:call-template name="reportHeader"/>
                
                <!-- Reusable Footer -->
                <xsl:call-template name="reportFooter"/>
   
              
                <fo:flow flow-name="xsl-region-body">
                    
                    <xsl:if test="/report/sections/section">
                        
                        <!-- TOC HEADING -->
                        <fo:block
                            font-family="Times New Roman"
                            font-size="12pt"
                            font-weight="bold"
                            text-align="center"
                            space-before="0.25in"
                            space-after="18pt"
                            keep-with-next.within-page="always">
                            TABLE OF CONTENTS
                        </fo:block>
                        
                        <!-- TOC ENTRIES -->
                        <xsl:apply-templates
                            select="/report/sections/section"
                            mode="toc">
                            <xsl:with-param name="depth" select="1"/>
                        </xsl:apply-templates>
                        
                    </xsl:if>
                    
                </fo:flow>
                
            </fo:page-sequence>
            
    <!--  Main report: restart page numbering at Arabic page 1.  -->
            <fo:page-sequence master-reference="report-page" initial-page-number="1" format="1">
                
                <!-- Reusable Header -->
                <xsl:call-template name="reportHeader"/>
                
                <!-- Reusable Footer -->
                <xsl:call-template name="reportFooter"/>
                >
                <fo:flow flow-name="xsl-region-body">
                    <!--  Main report sections  -->
                    <xsl:choose>
                        <xsl:when test="/report/sections/section">
                            <xsl:apply-templates select="/report/sections/section" mode="body">
                                <xsl:with-param name="depth" select="1"/>
                            </xsl:apply-templates>
                        </xsl:when>
                        <xsl:otherwise>
                            <fo:block font-style="italic" color="#000000"> This report does not contain any sections. </fo:block>
                        </xsl:otherwise>
                    </xsl:choose>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>

    <!-- TOC Section Template -->
    <xsl:template match="section" mode="toc">
        <xsl:param name="depth" select="1"/>
        
        <fo:table
            table-layout="fixed"
            width="100%"
            space-after="5pt">
            
            <fo:table-column column-width="proportional-column-width(1)"/>
            <fo:table-column column-width="0.18in"/>
            
            <fo:table-body>
                <fo:table-row>
                    
                    <!-- Section title and dotted leader -->
                    <fo:table-cell>
                        <fo:block
                            font-family="Times New Roman"
                            text-align-last="justify"
                            letter-spacing="0pt"
                            start-indent="{($depth - 1) * 14}pt">
                            
                            <xsl:attribute name="font-size">
                                <xsl:choose>
                                    <xsl:when test="$depth = 1">12pt</xsl:when>
                                    <xsl:otherwise>10pt</xsl:otherwise>
                                </xsl:choose>
                            </xsl:attribute>
                            
                            <fo:basic-link
                                internal-destination="{generate-id()}"
                                color="#000000"
                                text-decoration="none">
                                
                                <xsl:call-template name="sectionNumber"/>
                                
                                <xsl:choose>
                                    <xsl:when test="$depth = 1">
                                        <xsl:text>. </xsl:text>
                                    </xsl:when>
                                    <xsl:otherwise>
                                        <xsl:text> </xsl:text>
                                    </xsl:otherwise>
                                </xsl:choose>
                                
                                <xsl:call-template name="smallCaps">
                                    <xsl:with-param name="text" select="title"/>
                                </xsl:call-template>
                                
                            </fo:basic-link>
                            
                            <fo:leader
                                leader-pattern="dots"
                                leader-length.optimum="100%"/>
                            
                        </fo:block>
                    </fo:table-cell>
                    
                    <!-- Right-aligned page number -->
                    <fo:table-cell>
                        <fo:block
                            font-family="Times New Roman"
                            font-size="10pt"
                            text-align="end">
                            
                            <fo:page-number-citation
                                ref-id="{generate-id()}"/>
                            
                        </fo:block>
                    </fo:table-cell>
                    
                </fo:table-row>
            </fo:table-body>
        </fo:table>
        
        <!-- Nested subsections -->
        <xsl:apply-templates
            select="subsections/section"
            mode="toc">
            
            <xsl:with-param name="depth" select="$depth + 1"/>
            
        </xsl:apply-templates>
        
    </xsl:template>
    <!-- Report Body Template -->
    <xsl:template match="section" mode="body">
        <xsl:param name="depth" select="1"/>
        
        <!-- Section heading -->
        <fo:block
            id="{generate-id()}"
            font-family="Times New Roman"
            font-size="10pt"
            font-weight="bold"
            color="#000000"
            text-decoration="underline"
            space-after="4pt">
            
            <xsl:attribute name="space-before">
                <xsl:choose>
                    <xsl:when test="$depth = 1">10pt</xsl:when>
                    <xsl:otherwise>6pt</xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            
            <xsl:call-template name="sectionNumber"/>
            <xsl:text>. </xsl:text>
            
            <xsl:choose>
                <xsl:when test="$depth = 1">
                    <xsl:value-of select="translate(title,
                        'abcdefghijklmnopqrstuvwxyz',
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="title"/>
                </xsl:otherwise>
            </xsl:choose>
            
        </fo:block>
        
        <!-- Nested subsections -->
        <xsl:apply-templates
            select="subsections/section"
            mode="body">
            <xsl:with-param name="depth" select="$depth + 1"/>
        </xsl:apply-templates>
        
    </xsl:template>
    <!-- Custom Section: Seismic Hazards -->
    <xsl:template
        match="section[normalize-space(title)='Seismic Hazards']"
        mode="body">
        
        <xsl:param name="depth" select="1"/>
        
        <!-- Section heading -->
        <fo:block
            id="{generate-id()}"
            space-after="5pt"
            keep-with-next.within-page="always">
            
            <xsl:attribute name="space-before">
                <xsl:choose>
                    <xsl:when test="$depth = 1">14pt</xsl:when>
                    <xsl:otherwise>9pt</xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            
            <fo:inline
                font-family="Times New Roman"
                font-size="10pt"
                font-weight="bold"
                color="#000000"
                text-decoration="underline">
                
                <xsl:call-template name="sectionNumber"/>.
                <xsl:text> </xsl:text>
                
                <xsl:value-of select="translate(title,
                    'abcdefghijklmnopqrstuvwxyz',
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                
            </fo:inline>
        </fo:block>
        
        <!-- Section content -->
  
        <xsl:if test="string(content)">
            <fo:block
                font-family="Times New Roman"
                font-size="10pt"
                line-height="14pt"
                space-after="7pt"
                text-align="justify"
                white-space-collapse="false"
                linefeed-treatment="preserve"
                wrap-option="wrap">
                
                <xsl:value-of select="content"/>
                
            </fo:block>
        </xsl:if>
   
        <xsl:apply-templates
            select="subsections/section"
            mode="body">
            
            <xsl:with-param name="depth" select="$depth + 1"/>
            
        </xsl:apply-templates>
        
    </xsl:template>
    <!--  Section Number Template  -->
    <xsl:template name="sectionNumber">
        <xsl:choose>
            <!-- Appendix heading: A, B, C -->
            <xsl:when test="starts-with(normalize-space(title), 'Appendix')
                and parent::sections">
                <xsl:number
                    level="single"
                    count="section[starts-with(normalize-space(title), 'Appendix')]"
                    format="A"/>
            </xsl:when>
            
            <!-- Subsections within an appendix: A.1, A.2, B.1 -->
            <xsl:when test="ancestor::section[
                starts-with(normalize-space(title), 'Appendix')
                and parent::sections
                ]">
                <xsl:for-each select="ancestor::section[
                    starts-with(normalize-space(title), 'Appendix')
                    and parent::sections
                    ]">
                    <xsl:number
                        level="single"
                        count="section[starts-with(normalize-space(title), 'Appendix')]"
                        format="A"/>
                </xsl:for-each>
                <xsl:text>.</xsl:text>
                <xsl:number level="multiple"
                    count="section"
                    from="section[starts-with(normalize-space(title), 'Appendix')]"
                    format="1.1"/>
            </xsl:when>
            
            <!-- Normal report sections -->
            <xsl:otherwise>
                <xsl:number level="multiple"
                    count="section"
                    from="report"
                    format="1.1"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <!-- Header Templete -->
    <xsl:template name="reportHeader">
        
        <fo:static-content flow-name="xsl-region-before">
            
            <fo:table
                table-layout="fixed"
                width="100%"
                font-family="Times New Roman"
                font-size="10pt"
                color="#000000"
                border-bottom="0.75pt solid #000000"
                padding-bottom="4pt">
                
                <fo:table-column column-width="1.25in"/>
                <fo:table-column column-width="3.75in"/>
                <fo:table-column column-width="1.50in"/>
                
                <fo:table-body>
                    
                    <fo:table-row>
                        <fo:table-cell>
                            <fo:block text-align="left">
                                Proj. No. <xsl:value-of select="/report/projectnumber"/>
                            </fo:block>
                        </fo:table-cell>
                        
                        <fo:table-cell>
                            <fo:block text-align="center">
                                <xsl:value-of select="/report/reporttitle"/>
                                <xsl:text> / </xsl:text>
                                <xsl:value-of select="/report/projecttitle"/>
                            </fo:block>
                        </fo:table-cell>
                        
                        <fo:table-cell>
                            <fo:block text-align="right">
                                <xsl:value-of select="/report/datereport"/>
                            </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    
                    <fo:table-row>
                        <fo:table-cell number-columns-spanned="3"
                            padding-bottom="5pt">
                            <fo:block text-align="center">
                                <xsl:value-of select="/report/projectaddress"/>
                                <xsl:text> </xsl:text>
                                <xsl:value-of select="/report/projectcity"/>, CA
                            </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    
                </fo:table-body>
            </fo:table>
            
        </fo:static-content>
        
    </xsl:template> 
    <!-- Footer Template --> 
    <xsl:template name="reportFooter">
        
        <fo:static-content flow-name="xsl-region-after">
            
            <fo:table
                table-layout="fixed"
                width="100%"
                font-family="Times New Roman"
                font-size="10pt"
                color="#000000"
                border-top="0.75pt solid #000000"
                padding-top="4pt">
                
                <fo:table-column column-width="proportional-column-width(1)"/>
                <fo:table-column column-width="proportional-column-width(1)"/>
                <fo:table-column column-width="proportional-column-width(1)"/>
                
                <fo:table-body>
                    <fo:table-row>
                        
                        <fo:table-cell padding-top="5pt">
                            <fo:block
                                text-align="left"
                                font-weight="bold"
                                font-style="italic">
                                GFK &amp; ASSOCIATES, INC
                            </fo:block>
                        </fo:table-cell>
                        
                        <fo:table-cell padding-top="5pt">
                            <fo:block
                                text-align="center"
                                font-weight="bold"
                                font-style="italic">
                                Geotechnical Consultants
                            </fo:block>
                        </fo:table-cell>
                        
                        <fo:table-cell padding-top="5pt">
                            <fo:block
                                text-align="right"
                                font-weight="bold">
                                Page <fo:page-number/>
                            </fo:block>
                        </fo:table-cell>
                        
                    </fo:table-row>
                </fo:table-body>
                
            </fo:table>
            
        </fo:static-content>
        
    </xsl:template>
    <!-- smallcaps template -->
    <xsl:template name="smallCaps">
        <xsl:param name="text"/>
        
        <xsl:if test="string-length($text) &gt; 0">
            
            <xsl:choose>
                
                <!-- Process each word separately -->
                <xsl:when test="contains($text, ' ')">
                    
                    <xsl:call-template name="smallCapsWord">
                        <xsl:with-param name="word"
                            select="substring-before($text, ' ')"/>
                    </xsl:call-template>
                    
                    <xsl:text> </xsl:text>
                    
                    <xsl:call-template name="smallCaps">
                        <xsl:with-param name="text"
                            select="substring-after($text, ' ')"/>
                    </xsl:call-template>
                    
                </xsl:when>
                
                <xsl:otherwise>
                    
                    <xsl:call-template name="smallCapsWord">
                        <xsl:with-param name="word" select="$text"/>
                    </xsl:call-template>
                    
                </xsl:otherwise>
                
            </xsl:choose>
            
        </xsl:if>
    </xsl:template>
    
    
    <xsl:template name="smallCapsWord">
        <xsl:param name="word"/>
        
        <xsl:if test="string-length($word) &gt; 0">
            
            <fo:inline font-family="Times New Roman" font-size="80%">
                <fo:inline font-size="125%">
                    <xsl:value-of select="translate(
                        substring($word, 1, 1),
                        'abcdefghijklmnopqrstuvwxyz',
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                </fo:inline>
                <xsl:value-of select="translate(
                    substring($word, 2),
                    'abcdefghijklmnopqrstuvwxyz',
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
            </fo:inline>
            
        </xsl:if>
    </xsl:template>
 

</xsl:stylesheet>