<!--  
  GFK & ASSOCIATES, INC. - LETTER-STYLE REPORT TEMPLATE
  XSLT 1.0 / XSL-FO compatible with Oxygen XML and Apache FOP.

  Uses existing /report metadata and recursive /report/sections/section schema.
  Section heading source is section/title, falling back to section/section.
  Blank headings are omitted; content/subsections are ALWAYS retained.

  This template has ONE page-sequence with alternate first/rest page masters.
  Page numbering remains 1,2,3,... automatically, including all tables.

  First page: company letterhead (optional logo), client and subject blocks,
  centered company information footer.
  Following pages: GFK report header and footer matching gfkreport.xsl.

  SPECIAL SECTION DATA CONTRACTS (V4): data is embedded in its owning section;
  there are NO root-level costestimates/compactiontables or XSLT lookup keys.
    <section><type>costestimate</type><referenceid>PROPOSAL_ID</referenceid>
      <costestimate><proposalid>PROPOSAL_ID</proposalid>
        <items><item>...</item></items><total>...</total>
      </costestimate>
    </section>
    <section><type>compactiontable</type><referenceid>TABLE_ID</referenceid>
      <compactiontable><tableid>TABLE_ID</tableid><tabletitle>...</tabletitle>
        <compactiontests><test>...</test></compactiontests>
        <compactioncurves><curve>...</curve></compactioncurves>
      </compactiontable>
    </section>
  Curves are included in the XML for future table/calculation formatting; they
  are not currently rendered. Existing recursive sectionSchema remains unchanged.

  IMAGE MODES: For Oxygen pass an accessible HTTPS logo URL; for server FOP
  pass a local file:/// URI to this same template. Do not change this XSL.
  -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0">
<xsl:output method="xml" encoding="UTF-8" indent="yes"/>
<xsl:strip-space elements="report sections section subsections costestimate items item compactiontable compactiontests test compactiontest compactioncurves curve"/>
<!--   Configurable values; no unverified address or telephone is hardcoded.   -->
<xsl:param name="logo-uri" select="''"/>
<xsl:param name="company-name" select="'GFK &amp; ASSOCIATES, INC.'"/>
<xsl:param name="company-tagline" select="'Geotechnical Consultants'"/>
<xsl:param name="company-contact-line" select="''"/>
<xsl:param name="number-sections" select="'yes'"/>
<xsl:param name="state-suffix" select="', CA'"/>
<xsl:variable name="resolved-logo">
<xsl:choose>
<xsl:when test="normalize-space($logo-uri) != ''">
<xsl:value-of select="$logo-uri"/>
</xsl:when>
<xsl:when test="normalize-space(/report/companylogo) != ''">
<xsl:value-of select="/report/companylogo"/>
</xsl:when>
<xsl:when test="normalize-space(/report/logoimageurl) != ''">
<xsl:value-of select="/report/logoimageurl"/>
</xsl:when>
</xsl:choose>
</xsl:variable>
<xsl:template match="/">
<fo:root font-family="Times New Roman" font-size="10pt" color="#000000">
<fo:layout-master-set>
<!--   Letterhead only: larger first-page header, smaller first footer.   -->
<fo:simple-page-master master-name="gfk-first" page-width="8.5in" page-height="11in" margin-left="1in" margin-right="1in" margin-top="0.40in" margin-bottom="0.62in">
<fo:region-body margin-top="1.52in" margin-bottom="0.35in"/>
<fo:region-before region-name="first-page-header" extent="1.32in"/>
<fo:region-after region-name="first-page-footer" extent="0.30in"/>
</fo:simple-page-master>
<!--   Match the established GFK report layout for page 2 onward.   -->
<fo:simple-page-master master-name="gfk-rest" page-width="8.5in" page-height="11in" margin-left="1in" margin-right="1in" margin-top="1in" margin-bottom="1in">
<fo:region-body margin-top="0.85in" margin-bottom="0.45in"/>
<fo:region-before region-name="report-page-header" extent="0.55in"/>
<fo:region-after region-name="report-page-footer" extent="0.35in"/>
</fo:simple-page-master>
<!--   Single sequence means true continuous pagination, even mid-section.   -->
<fo:page-sequence-master master-name="gfk-letter-master">
<fo:repeatable-page-master-alternatives>
<fo:conditional-page-master-reference master-reference="gfk-first" page-position="first"/>
<fo:conditional-page-master-reference master-reference="gfk-rest" page-position="rest"/>
</fo:repeatable-page-master-alternatives>
</fo:page-sequence-master>
</fo:layout-master-set>
<fo:page-sequence master-reference="gfk-letter-master" initial-page-number="1" format="1" force-page-count="no-force">
<xsl:call-template name="letterheadHeader"/>
<xsl:call-template name="letterheadFooter"/>
<xsl:call-template name="reportHeader"/>
<xsl:call-template name="reportFooter"/>
<fo:flow flow-name="xsl-region-body">
<xsl:call-template name="clientAndSubject"/>
<!--   No cover page, no TOC, and no separately numbered appendices.   -->
<xsl:apply-templates select="/report/sections/section" mode="report-body">
<xsl:with-param name="depth" select="1"/>
</xsl:apply-templates>
</fo:flow>
</fo:page-sequence>
</fo:root>
</xsl:template>
<!--   FIRST PAGE STATIC HEADER (1.25in company letterhead/logo region)   -->
<xsl:template name="letterheadHeader">
<fo:static-content flow-name="first-page-header">
<fo:block text-align="center" font-family="Times New Roman">
<xsl:choose>
<xsl:when test="normalize-space($resolved-logo) != ''">
<!--   logo-uri may be HTTPS for Oxygen or file:/// for Apache FOP.   -->
<fo:external-graphic src="url('{$resolved-logo}')" content-height="1.20in" content-width="scale-to-fit" scaling="uniform"/>
</xsl:when>
<xsl:otherwise>
<fo:block font-weight="bold" font-size="18pt" space-before="15pt">
<xsl:value-of select="$company-name"/>
</fo:block>
<fo:block font-style="italic" font-size="11pt">
<xsl:value-of select="$company-tagline"/>
</fo:block>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:static-content>
</xsl:template>
<!--   FIRST PAGE STATIC FOOTER (single centered company information line)   -->
<xsl:template name="letterheadFooter">
<fo:static-content flow-name="first-page-footer">
<fo:block text-align="center" font-size="8pt" line-height="11pt" border-top="0.5pt solid #000000" padding-top="3pt">
<xsl:value-of select="$company-name"/>
<xsl:text> | </xsl:text>
<xsl:value-of select="$company-tagline"/>
<xsl:choose>
<xsl:when test="normalize-space(/report/companyinfo) != ''">
<xsl:text> | </xsl:text>
<xsl:value-of select="/report/companyinfo"/>
</xsl:when>
<xsl:when test="normalize-space($company-contact-line) != ''">
<xsl:text> | </xsl:text>
<xsl:value-of select="$company-contact-line"/>
</xsl:when>
</xsl:choose>
</fo:block>
</fo:static-content>
</xsl:template>
<!--   SUBSEQUENT PAGES: EXISTING GFK STYLE HEADER   -->
<xsl:template name="reportHeader">
<fo:static-content flow-name="report-page-header">
<fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="10pt" color="#000000" border-bottom="0.75pt solid #000000">
<fo:table-column column-width="1.25in"/>
<fo:table-column column-width="3.75in"/>
<fo:table-column column-width="1.50in"/>
<fo:table-body>
<fo:table-row>
<fo:table-cell>
<fo:block text-align="left">
<xsl:text>Proj. No. </xsl:text>
<xsl:value-of select="/report/projectnumber"/>
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
<fo:table-cell number-columns-spanned="3" padding-bottom="5pt">
<fo:block text-align="center">
<xsl:value-of select="/report/projectaddress"/>
<xsl:text> </xsl:text>
<xsl:value-of select="/report/projectcity"/>
<xsl:value-of select="$state-suffix"/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</fo:static-content>
</xsl:template>
<!--   SUBSEQUENT PAGES: EXISTING GFK STYLE FOOTER   -->
<xsl:template name="reportFooter">
<fo:static-content flow-name="report-page-footer">
<fo:table table-layout="fixed" width="100%" font-size="10pt" border-top="0.75pt solid #000000" padding-top="4pt">
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-body>
<fo:table-row>
<fo:table-cell padding-top="5pt">
<fo:block text-align="left" font-weight="bold" font-style="italic">
<xsl:value-of select="$company-name"/>
</fo:block>
</fo:table-cell>
<fo:table-cell padding-top="5pt">
<fo:block text-align="center" font-weight="bold" font-style="italic">
<xsl:value-of select="$company-tagline"/>
</fo:block>
</fo:table-cell>
<fo:table-cell padding-top="5pt">
<fo:block text-align="right" font-weight="bold">
Page
<fo:page-number/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</fo:static-content>
</xsl:template>
<!--   DATE, CLIENT, SUBJECT ARE PART OF FLOW AND APPEAR ON FIRST PAGE ONLY   -->
<xsl:template name="clientAndSubject">
<fo:block font-size="10pt" line-height="14pt" space-after="14pt">
<xsl:value-of select="/report/datereport"/>
</fo:block>
<fo:block font-size="10pt" line-height="14pt" space-after="17pt">
<fo:block>
<xsl:choose>
<xsl:when test="normalize-space(/report/client) != ''">
<xsl:value-of select="/report/client"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="/report/clientname"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
<xsl:if test="normalize-space(/report/clientaddress) != ''">
<fo:block>
<xsl:value-of select="/report/clientaddress"/>
</fo:block>
</xsl:if>
<xsl:if test="normalize-space(/report/clientcity) != ''">
<fo:block>
<xsl:value-of select="/report/clientcity"/>
</fo:block>
</xsl:if>
<xsl:if test="normalize-space(/report/attention) != ''">
<fo:block space-before="4pt">
Attn:
<xsl:value-of select="/report/attention"/>
</fo:block>
</xsl:if>
</fo:block>
<fo:table table-layout="fixed" width="100%" space-after="18pt">
<fo:table-column column-width="0.72in"/>
<fo:table-column column-width="5.78in"/>
<fo:table-body>
<fo:table-row>
<fo:table-cell display-align="before">
<fo:block font-weight="bold">Subject:</fo:block>
</fo:table-cell>
<fo:table-cell>
<!--   REQUIRED ORDER: project title, project address/city, report title (bold).   -->
<fo:block>
<xsl:value-of select="/report/projecttitle"/>
</fo:block>
<fo:block>
<xsl:value-of select="/report/projectaddress"/>
<xsl:if test="normalize-space(/report/projectcity) != ''">
<xsl:text>, </xsl:text>
<xsl:value-of select="/report/projectcity"/>
<xsl:value-of select="$state-suffix"/>
</xsl:if>
</fo:block>
<fo:block font-weight="bold" space-before="3pt">
<xsl:value-of select="/report/reporttitle"/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</xsl:template>
<!--   Recursive section output; headings are optional. No TOC.   -->
<xsl:template match="section" mode="report-body">
<xsl:param name="depth" select="1"/>
<xsl:variable name="kind" select="translate(normalize-space(type),'ABCDEFGHIJKLMNOPQRSTUVWXYZ -_','abcdefghijklmnopqrstuvwxyz')"/>
<!--   title is the XSL's historical field; section is the Mongo schema field.   -->
<xsl:if test="normalize-space(title) != '' or normalize-space(section) != ''">
<fo:block id="{generate-id()}" font-family="Times New Roman" font-size="10pt" font-weight="bold" text-decoration="underline" space-before="10pt" space-after="5pt" keep-with-next.within-page="always">
<xsl:if test="$number-sections = 'yes'">
<!--   Number titled sections only; untitled content blocks do not consume numbers.   -->
<xsl:number level="multiple" count="section[normalize-space(title) != '' or normalize-space(section) != '']" from="report" format="1.1"/>
<xsl:text>. </xsl:text>
</xsl:if>
<xsl:choose>
<xsl:when test="normalize-space(title) != ''">
<xsl:call-template name="sectionTitle">
<xsl:with-param name="value" select="title"/>
<xsl:with-param name="depth" select="$depth"/>
</xsl:call-template>
</xsl:when>
<xsl:otherwise>
<xsl:call-template name="sectionTitle">
<xsl:with-param name="value" select="section"/>
<xsl:with-param name="depth" select="$depth"/>
</xsl:call-template>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</xsl:if>
<!--   Body text is displayed even if no section heading exists.   -->
<xsl:if test="normalize-space(content) != ''">
<fo:block font-size="10pt" line-height="14pt" text-align="justify" white-space-collapse="false" linefeed-treatment="preserve" space-after="8pt">
<xsl:value-of select="content"/>
</fo:block>
</xsl:if>
<xsl:choose>
<xsl:when test="$kind = 'costestimate'">
<xsl:call-template name="costEstimateTable"/>
</xsl:when>
<xsl:when test="$kind = 'compactiontable' or $kind = 'compactiontables' or $kind = 'compactiontests' or $kind = 'compaction'">
<xsl:call-template name="compactionTable"/>
</xsl:when>
</xsl:choose>
<!--   Recursive nesting is retained regardless of section type or title.   -->
<xsl:apply-templates select="subsections/section" mode="report-body">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<xsl:template name="sectionTitle">
<xsl:param name="value"/>
<xsl:param name="depth" select="1"/>
<xsl:choose>
<xsl:when test="$depth = 1">
<xsl:value-of select="translate($value,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="$value"/>
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--   COST ESTIMATE SPECIAL SECTION   -->
<xsl:template name="costEstimateTable">
<!--  This section owns the only estimate to be rendered here.  -->
<xsl:variable name="rows" select="costestimate/items/item"/>
<xsl:variable name="givenTotal" select="costestimate/total"/>
<xsl:choose>
<xsl:when test="$rows">
<fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="9pt" border-collapse="collapse" space-before="7pt" space-after="11pt">
<fo:table-column column-width="0.45in"/>
<fo:table-column column-width="2.65in"/>
<fo:table-column column-width="0.65in"/>
<fo:table-column column-width="0.55in"/>
<fo:table-column column-width="1.05in"/>
<fo:table-column column-width="1.15in"/>
<fo:table-header>
<fo:table-row background-color="#E8E8E8" font-weight="bold">
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block>No.</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block>Description</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block text-align="right">Qty.</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block>Unit</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block text-align="right">Unit Price</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="4pt">
<fo:block text-align="right">Amount</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-header>
<fo:table-body>
<xsl:for-each select="$rows">
<fo:table-row keep-together.within-page="always">
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block>
<xsl:choose>
<xsl:when test="normalize-space(itemnumber) != ''">
<xsl:value-of select="itemnumber"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="position()"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block>
<xsl:value-of select="description"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block text-align="right">
<xsl:value-of select="quantity"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block>
<xsl:value-of select="unit"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block text-align="right">
<xsl:choose>
<xsl:when test="normalize-space(unitprice) != '' and number(unitprice) = number(unitprice)">
<xsl:value-of select="format-number(number(unitprice),'$#,##0.00')"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="unitprice"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="3pt">
<fo:block text-align="right">
<xsl:choose>
<xsl:when test="normalize-space(amount) != '' and number(amount) = number(amount)">
<xsl:value-of select="format-number(number(amount),'$#,##0.00')"/>
</xsl:when>
<xsl:when test="number(quantity) = number(quantity) and number(unitprice) = number(unitprice)">
<xsl:value-of select="format-number(number(quantity) * number(unitprice),'$#,##0.00')"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="amount"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:table-cell>
</fo:table-row>
</xsl:for-each>
<fo:table-row font-weight="bold" background-color="#F4F4F4" keep-together.within-page="always">
<fo:table-cell number-columns-spanned="5" border="0.5pt solid black" padding="5pt">
<fo:block text-align="right">TOTAL ESTIMATED COST</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" padding="5pt">
<fo:block text-align="right">
<xsl:choose>
<xsl:when test="normalize-space($givenTotal) != '' and number($givenTotal) = number($givenTotal)">
<xsl:value-of select="format-number(number($givenTotal),'$#,##0.00')"/>
</xsl:when>
<!--   Safe fallback only if every row has a numeric amount.   -->
<xsl:when test="count($rows) = count($rows[number(amount) = number(amount) and normalize-space(amount) != ''])">
<xsl:value-of select="format-number(sum($rows/amount),'$#,##0.00')"/>
</xsl:when>
<xsl:otherwise>See estimate</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</xsl:when>
<xsl:otherwise>
<!--   No rows: omit the table, but retain section content.   -->
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--   COMPACTION TEST RESULTS SPECIAL SECTION   -->


<xsl:template name="compactionTable">

    <!-- Tests selected for the current section -->
    <xsl:variable name="rows"
        select="compactiontable/compactiontests/test"/>
    
    
    <!-- Only curves referenced by tests in this table -->
    
    <xsl:variable name="curves"
        select="compactiontable/compactioncurves/curve[
        normalize-space(curveid) = $rows/curveid
        ]"/>
    
    
    <!-- ============================================ -->
    <!-- GFK COMPACTION CURVES TABLE -->
    <!-- ============================================ -->
    
    <xsl:if test="$curves">
        
        <!-- TABLE TITLE -->
        
        <fo:block
            font-family="Times New Roman"
            font-size="10pt"
            font-weight="bold"
            text-align="center"
            space-before="12pt"
            space-after="8pt"
            keep-with-next.within-page="always">
            
            COMPACTION CURVES
            
        </fo:block>
        
        <fo:table
            table-layout="fixed"
            width="100%"
            font-family="Times New Roman"
            font-size="9pt"
            border-collapse="collapse"
            space-after="12pt">
            
            <!-- Total width: 6.50 inches -->
            
            <fo:table-column column-width="0.85in"/>
            <fo:table-column column-width="3.00in"/>
            <fo:table-column column-width="1.35in"/>
            <fo:table-column column-width="1.30in"/>
            
            <!-- TABLE HEADER -->
            
            <fo:table-header>
                
                <fo:table-row
                    background-color="#E8E8E8"
                    font-weight="bold">
                    
                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        
                        <fo:block text-align="center">
                            Curve No.
                        </fo:block>
                        
                    </fo:table-cell>
                    
                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        
                        <fo:block>
                            Description
                        </fo:block>
                        
                    </fo:table-cell>
                    
                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        
                        <fo:block text-align="center">
                            Max. Dry Density (pcf)
                        </fo:block>
                        
                    </fo:table-cell>
                    
                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        
                        <fo:block text-align="center">
                            Opt. Moisture (%)
                        </fo:block>
                        
                    </fo:table-cell>
                    
                </fo:table-row>
                
            </fo:table-header>
            
            <!-- TABLE BODY -->
            
            <fo:table-body>
                
                <xsl:for-each select="$curves">
                    
                    <fo:table-row
                        keep-together.within-page="always">
                        
                        <!-- CURVE NUMBER -->
                        
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block text-align="center">
                                <xsl:value-of select="curvenumber"/>
                            </fo:block>
                            
                        </fo:table-cell>
                        
                        <!-- DESCRIPTION -->
                        
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block
                                text-align="center">
                                <xsl:value-of select="description"/>
                            </fo:block>
                            
                        </fo:table-cell>
                        
                        <!-- MAXIMUM DRY DENSITY -->
                        
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block text-align="center">
                                
                                <xsl:choose>
                                    
                                    <xsl:when test="
                                        normalize-space(maxden) != ''
                                        and number(maxden) = number(maxden)">
                                        
                                        <xsl:value-of
                                            select="format-number(
                                            number(maxden),
                                            '0.0'
                                            )"/>
                                        
                                    </xsl:when>
                                    
                                    <xsl:otherwise>
                                        <xsl:value-of select="maxden"/>
                                    </xsl:otherwise>
                                    
                                </xsl:choose>
                                
                            </fo:block>
                            
                        </fo:table-cell>
                        
                        <!-- OPTIMUM MOISTURE CONTENT -->
                        
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block text-align="center">
                                
                                <xsl:choose>
                                    
                                    <xsl:when test="
                                        normalize-space(moist) != ''
                                        and number(moist) = number(moist)">
                                        
                                        <xsl:value-of
                                            select="format-number(
                                            number(moist),
                                            '0.0'
                                            )"/>
                                        
                                    </xsl:when>
                                    
                                    <xsl:otherwise>
                                        <xsl:value-of select="moist"/>
                                    </xsl:otherwise>
                                    
                                </xsl:choose>
                                
                            </fo:block>
                            
                        </fo:table-cell>
                        
                    </fo:table-row>
                    
                </xsl:for-each>
                
            </fo:table-body>
            
        </fo:table>
        
    </xsl:if>
    
    <!-- ============================================ -->
    <!-- GFK COMPACTION TABLE -->
    <!-- ============================================ -->

    <xsl:if test="$rows">
        
        
        <!-- COMPACTION TABLE TITLE -->
        
        <xsl:if test="normalize-space(compactiontable/tabletitle) != ''">
            
            <fo:block
                font-family="Times New Roman"
                font-size="10pt"
                font-weight="bold"
                text-align="center"
                space-before="10pt"
                space-after="8pt"
                keep-with-next.within-page="always">
                
                <xsl:value-of select="translate(
                    normalize-space(compactiontable/tabletitle),
                    'abcdefghijklmnopqrstuvwxyz',
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                    )"/>
                
            </fo:block>
            
        </xsl:if>
        

        <fo:table
            table-layout="fixed"
            width="100%"
            font-family="Times New Roman"
            font-size="8pt"
            border-collapse="collapse"
            space-before="7pt"
            space-after="12pt">

            <!-- Column widths total 6.50 inches -->

            <fo:table-column column-width="0.45in"/>
            <fo:table-column column-width="0.75in"/>
            <fo:table-column column-width="1.20in"/>
            <fo:table-column column-width="0.80in"/>
            <fo:table-column column-width="0.65in"/>
            <fo:table-column column-width="0.85in"/>
            <fo:table-column column-width="0.70in"/>
            <fo:table-column column-width="1.10in"/>

            <!-- ================================= -->
            <!-- TABLE HEADER -->
            <!-- ================================= -->

            <fo:table-header>

                <fo:table-row
                    background-color="#E8E8E8"
                    font-weight="bold">

                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block>Test</fo:block>
                    </fo:table-cell>

                   

                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block>Date</fo:block>
                    </fo:table-cell>
                    
                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block>Location</fo:block>
                    </fo:table-cell>

                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block text-align="center">
                            Dry Density
                            (pcf)
                        </fo:block>
                    </fo:table-cell>

                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block text-align="center">
                            Moisture
                            (%)
                        </fo:block>
                    </fo:table-cell>

                    <fo:table-cell
                        border="0.5pt solid black"
                        padding="4pt">
                        <fo:block text-align="center">
                            Relative
                            Comp. (%)
                        </fo:block>
                    </fo:table-cell>


                    <!-- CURVE NUMBER -->
                    <fo:table-cell border="0.5pt solid black" padding="3pt">
                        <fo:block text-align="center">
                            Curve No.
                        </fo:block>
                    </fo:table-cell>
                    
                    <!-- MAXIMUM DRY DENSITY -->
                    <fo:table-cell border="0.5pt solid black" padding="3pt">
                        <fo:block text-align="center">
                            Max. Dry Density (pcf)
                        </fo:block>
                    </fo:table-cell>
                    

                </fo:table-row>

            </fo:table-header>

            <!-- ================================= -->
            <!-- TABLE BODY -->
            <!-- ================================= -->

            <fo:table-body>

                <xsl:for-each select="$rows">

                    <fo:table-row
                        keep-together.within-page="always">

                        <!-- TEST NUMBER -->

                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">

                            <fo:block text-align="center">

                                <xsl:choose>

                                    <xsl:when test="normalize-space(testnum) != ''">
                                        <xsl:value-of select="testnum"/>
                                    </xsl:when>

                                    <xsl:when test="normalize-space(testnumber) != ''">
                                        <xsl:value-of select="testnumber"/>
                                    </xsl:when>

                                    <xsl:when test="normalize-space(testid) != ''">
                                        <xsl:value-of select="testid"/>
                                    </xsl:when>

                                    <xsl:otherwise>
                                        <xsl:value-of select="position()"/>
                                    </xsl:otherwise>

                                </xsl:choose>

                            </fo:block>

                        </fo:table-cell>

                   

                        <!-- TEST DATE -->

                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">

                            <fo:block>

                                <xsl:variable name="dateValue">

                                    <xsl:choose>

                                        <xsl:when test="normalize-space(testdate) != ''">
                                            <xsl:value-of select="testdate"/>
                                        </xsl:when>

                                        <xsl:when test="normalize-space(timetest) != ''">
                                            <xsl:value-of select="timetest"/>
                                        </xsl:when>

                                        <xsl:otherwise>
                                            <xsl:value-of select="date"/>
                                        </xsl:otherwise>

                                    </xsl:choose>

                                </xsl:variable>

                                <xsl:choose>

                                    <!-- ISO datetime to date -->
                                    <xsl:when test="contains($dateValue, 'T')">
                                        <xsl:value-of
                                            select="substring-before($dateValue, 'T')"/>
                                    </xsl:when>

                                    <!-- Already formatted date -->
                                    <xsl:otherwise>
                                        <xsl:value-of select="$dateValue"/>
                                    </xsl:otherwise>

                                </xsl:choose>

                            </fo:block>

                        </fo:table-cell>
                        
                        <!-- LOCATION -->
                        
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">
                            
                            <fo:block>
                                <xsl:value-of select="location"/>
                            </fo:block>
                            
                        </fo:table-cell>

                        <!-- CALCULATED DRY DENSITY -->

                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">

                            <fo:block text-align="center">

                                <xsl:if test="
                                    normalize-space(drydensity) != ''
                                    and number(drydensity) = number(drydensity)">

                                    <xsl:value-of
                                        select="format-number(number(drydensity), '0.0')"/>

                                </xsl:if>

                            </fo:block>

                        </fo:table-cell>

                        <!-- CALCULATED MOISTURE CONTENT -->

                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">

                            <fo:block text-align="center">

                                <xsl:if test="
                                    normalize-space(moisture) != ''
                                    and number(moisture) = number(moisture)">

                                    <xsl:value-of
                                        select="format-number(number(moisture), '0.0')"/>

                                </xsl:if>

                            </fo:block>

                        </fo:table-cell>

                        <!-- CALCULATED RELATIVE COMPACTION -->

                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt">

                            <fo:block text-align="center">

                                <xsl:if test="
                                    normalize-space(relativecompaction) != ''
                                    and number(relativecompaction) = number(relativecompaction)">

                                    <xsl:value-of
                                        select="format-number(number(relativecompaction), '0.0')"/>

                                </xsl:if>

                            </fo:block>

                        </fo:table-cell>

                        <!-- RESULT / COMPACTION REQUIREMENT -->


                        <!-- CURVE NUMBER -->
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block text-align="center">
                                <xsl:value-of select="curvenumber"/>
                            </fo:block>
                            
                        </fo:table-cell>
                        
                        <!-- MAXIMUM DRY DENSITY -->
                        <fo:table-cell
                            border="0.5pt solid black"
                            padding="3pt"
                            display-align="center">
                            
                            <fo:block text-align="center">
                                
                                <xsl:if test="
                                    normalize-space(maxdrydensity) != ''
                                    and number(maxdrydensity) = number(maxdrydensity)">
                                    
                                    <xsl:value-of
                                        select="format-number(number(maxdrydensity), '0.0')"/>
                                    
                                </xsl:if>
                                
                            </fo:block>
                            
                        </fo:table-cell>
                        

                    </fo:table-row>

                </xsl:for-each>

            </fo:table-body>

        </fo:table>

    </xsl:if>

</xsl:template>
</xsl:stylesheet>