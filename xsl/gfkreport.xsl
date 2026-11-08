<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0">
<!--  GFK integrated report: cover, TOC, body, seismic, spectral response, appendix figures + boring logs; lab summary integrated. Figure sheets reuse the GFK Figure Stylesheet v4 layout. Requires existing logdraft-common.xsl in same folder. Oxygen uses HTTP imageurl; Apache FOP uses local file:/// imageurl supplied by Express.  -->
<xsl:output method="xml" encoding="UTF-8" indent="yes"/>
<xsl:include href="logdraft-common.xsl"/>
<xsl:key name="boring-by-id" match="report/borings/boring" use="normalize-space(boringid)"/>
<xsl:key name="figure-by-id" match="report/figures/figure" use="normalize-space(figureid)"/>
<xsl:param name="company-name" select="'civilengineer.io'"/>
<xsl:param name="footer-text" select="'Engineering Report'"/>
<xsl:template match="/">
<fo:root font-family="Times New Roman" font-size="12pt" font-weight="normal" color="#000000">
<fo:layout-master-set>
<fo:simple-page-master master-name="report-page" page-width="8.5in" page-height="11in" margin-top="1in" margin-bottom="1in" margin-left="1in" margin-right="1in">
<fo:region-body margin-top="0.85in" margin-bottom="0.45in"/>
<fo:region-before extent="0.55in"/>
<fo:region-after extent="0.35in"/>
</fo:simple-page-master>
<xsl:call-template name="boring-page-master"/>
<fo:simple-page-master master-name="figure-portrait" page-width="8.5in" page-height="11in">
<fo:region-body margin="0in"/>
</fo:simple-page-master>
<fo:simple-page-master master-name="figure-landscape" page-width="11in" page-height="8.5in">
<fo:region-body margin="0in"/>
</fo:simple-page-master>
<fo:simple-page-master master-name="labsummary-page" page-width="8.5in" page-height="11in" margin-left="0.5in" margin-right="0.25in" margin-top="0.5in" margin-bottom="0.5in">
<fo:region-body margin-top="1.0in" margin-bottom="0.55in"/>
<fo:region-before extent="0.85in"/>
<fo:region-after extent="0.45in"/>
</fo:simple-page-master>
</fo:layout-master-set>
<!--   Title Page   -->
<fo:page-sequence master-reference="report-page" initial-page-number="1" force-page-count="no-force" format="i">
<fo:flow flow-name="xsl-region-body">
<fo:block space-before="1.25in" text-align="center" font-family="Times New Roman" font-size="10pt" color="#000000">
<!--   Report Title   -->
<fo:block font-size="10pt" font-weight="bold" space-after="18pt">
<xsl:value-of select="translate(/report/reporttitle, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:block>
<!--   Project Information   -->
<fo:block font-size="10pt" font-weight="bold" space-after="0pt">
<xsl:value-of select="translate(/report/projecttitle, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:block>
<fo:block font-weight="bold">
<xsl:value-of select="translate(/report/projectaddress, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:block>
<fo:block font-weight="bold">
<xsl:value-of select="translate(/report/projectcity, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
, CA
</fo:block>
<!--   Prepared For   -->
<fo:block space-before="0.35in" font-weight="bold"> Prepared for </fo:block>
<fo:block font-weight="bold" space-after="0pt">
<xsl:value-of select="translate(/report/client, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:block>
<!--   Prepared By   -->
<fo:block space-before="1.75in" font-weight="bold"> By: </fo:block>
<fo:block font-weight="bold" font-style="italic"> GFK &amp; ASSOCIATES, INC </fo:block>
<fo:block font-weight="bold" font-style="italic"> Geotechnical Consultants </fo:block>
<!--   Project Number   -->
<fo:block space-before="0.5in" font-weight="bold">
Proj No.
<xsl:value-of select="/report/projectnumber"/>
</fo:block>
<!--   Report Date   -->
<fo:block font-weight="bold">
<xsl:value-of select="/report/datereport"/>
</fo:block>
</fo:block>
</fo:flow>
</fo:page-sequence>
<!--   TABLE OF CONTENTS   -->
<fo:page-sequence force-page-count="no-force" master-reference="report-page" initial-page-number="1" format="i">
<!--   Reusable Header   -->
<xsl:call-template name="reportHeader"/>
<!--   Reusable Footer   -->
<xsl:call-template name="reportFooter"/>
<fo:flow flow-name="xsl-region-body">
<xsl:if test="/report/sections/section">
<!--   TOC HEADING   -->
<fo:block font-family="Times New Roman" font-size="12pt" font-weight="bold" text-align="center" space-before="0.25in" space-after="18pt" keep-with-next.within-page="always"> TABLE OF CONTENTS </fo:block>
<!--   TOC ENTRIES   -->
<xsl:apply-templates select="/report/sections/section" mode="toc">
<xsl:with-param name="depth" select="1"/>
</xsl:apply-templates>
</xsl:if>
</fo:flow>
</fo:page-sequence>
<!--    Main report: restart page numbering at Arabic page 1.    -->
<fo:page-sequence master-reference="report-page" force-page-count="no-force" initial-page-number="1" format="1">
<!--   Reusable Header   -->
<xsl:call-template name="reportHeader"/>
<!--   Reusable Footer   -->
<xsl:call-template name="reportFooter"/>
<fo:flow flow-name="xsl-region-body">
<!--    Main report sections    -->
<xsl:choose>
<xsl:when test="/report/sections/section[not(normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')]">
<xsl:apply-templates select="/report/sections/section[not(normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')]" mode="body">
<xsl:with-param name="depth" select="1"/>
</xsl:apply-templates>
</xsl:when>
<xsl:otherwise>
<fo:block font-style="italic" color="#000000"> This report does not contain any sections. </fo:block>
</xsl:otherwise>
</xsl:choose>
</fo:flow>
</fo:page-sequence>
<!--   Appendices start after the main report sequence.   -->
<xsl:apply-templates select="/report/sections/section[normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary']" mode="appendix"/>
</fo:root>
</xsl:template>
<!--   TOC Section Template   -->
<xsl:template match="section" mode="toc">
<xsl:param name="depth" select="1"/>
<fo:table table-layout="fixed" width="100%" space-after="5pt">
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-column column-width="0.18in"/>
<fo:table-body>
<fo:table-row>
<!--   Section title and dotted leader   -->
<fo:table-cell>
<fo:block font-family="Times New Roman" text-align-last="justify" letter-spacing="0pt" start-indent="{($depth - 1) * 14}pt">
<xsl:attribute name="font-size">
<xsl:choose>
<xsl:when test="$depth = 1">12pt</xsl:when>
<xsl:otherwise>10pt</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<fo:basic-link internal-destination="{generate-id()}" color="#000000" text-decoration="none">
<xsl:choose>
<xsl:when test="parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')"/>
<xsl:otherwise>
<xsl:call-template name="sectionNumber"/>
</xsl:otherwise>
</xsl:choose>
<xsl:choose>
<xsl:when test="parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')"/>
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
<fo:leader leader-pattern="dots" leader-length.optimum="100%"/>
</fo:block>
</fo:table-cell>
<!--   Right-aligned page number   -->
<fo:table-cell>
<fo:block font-family="Times New Roman" font-size="10pt" text-align="end">
<xsl:for-each select="ancestor-or-self::section[parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure')][1]">
<xsl:number level="single" count="section[normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary']" format="A"/>
</xsl:for-each>
<fo:page-number-citation ref-id="{generate-id()}"/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
<!--   Nested subsections   -->
<xsl:apply-templates select="subsections/section" mode="toc">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<!--   Report Body Template   -->
<xsl:template match="section" mode="body">
<xsl:param name="depth" select="1"/>
<!--   Section heading   -->
<fo:block id="{generate-id()}" font-family="Times New Roman" font-size="10pt" font-weight="bold" color="#000000" text-decoration="underline" space-after="4pt">
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
<xsl:value-of select="translate(title, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="title"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
<!--   Nested subsections   -->
<xsl:if test="string(content)">
<fo:block font-family="Times New Roman" font-size="10pt" line-height="14pt" space-after="7pt" text-align="justify" white-space-collapse="false" linefeed-treatment="preserve" wrap-option="wrap">
<xsl:value-of select="content"/>
</fo:block>
</xsl:if>
<xsl:apply-templates select="subsections/section" mode="body">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<!--   Custom Section: Seismic Hazards   -->
<xsl:template match="section[normalize-space(type)='seismic']" mode="body">
<xsl:param name="depth" select="1"/>
<!--   Section heading   -->
<fo:block id="{generate-id()}" space-after="5pt" keep-with-next.within-page="always">
<xsl:attribute name="space-before">
<xsl:choose>
<xsl:when test="$depth = 1">14pt</xsl:when>
<xsl:otherwise>9pt</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<fo:inline font-family="Times New Roman" font-size="10pt" font-weight="bold" color="#000000" text-decoration="underline">
<xsl:call-template name="sectionNumber"/>
.
<xsl:text> </xsl:text>
<xsl:value-of select="translate(title, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:inline>
</fo:block>
<!--   Section content   -->
<xsl:if test="string(content)">
<fo:block font-family="Times New Roman" font-size="10pt" line-height="14pt" space-after="7pt" text-align="justify" white-space-collapse="false" linefeed-treatment="preserve" wrap-option="wrap">
<xsl:value-of select="content"/>
</fo:block>
</xsl:if>
<xsl:apply-templates select="subsections/section" mode="body">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<!--    Section Number Template    -->
<xsl:template name="sectionNumber">
<xsl:choose>
<!--   Count top-level appendix types A, B, C.   -->
<xsl:when test="parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')">
<xsl:number level="single" count="section[normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary']" format="A"/>
</xsl:when>
<!--   Under Appendix A, list boring log subsections as A.1, A.2, etc.   -->
<xsl:when test="ancestor::section[parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary')]">
<xsl:for-each select="ancestor::section[parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure')][1]">
<xsl:number level="single" count="section[normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary']" format="A"/>
</xsl:for-each>
<xsl:text>.</xsl:text>
<xsl:number level="multiple" count="section" from="section[parent::sections and (normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog')]" format="1.1"/>
</xsl:when>
<!--   Main report keeps its pre-existing 1.1 numbering.   -->
<xsl:otherwise>
<xsl:number level="multiple" count="section" from="report" format="1.1"/>
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--   Header Templete   -->
<xsl:template name="reportHeader">
<xsl:param name="middle-width" select="'3.75in'"/>
<fo:static-content flow-name="xsl-region-before">
<fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="10pt" color="#000000" border-bottom="0.75pt solid #000000" padding-bottom="4pt">
<fo:table-column column-width="1.25in"/>
<fo:table-column column-width="{$middle-width}"/>
<fo:table-column column-width="1.50in"/>
<fo:table-body>
<fo:table-row>
<fo:table-cell>
<fo:block text-align="left">
Proj. No.
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
, CA
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</fo:static-content>
</xsl:template>
<!--   Footer Template   -->
<xsl:template name="reportFooter">
<xsl:param name="page-prefix" select="''"/>
<fo:static-content flow-name="xsl-region-after">
<fo:table table-layout="fixed" width="100%" font-family="Times New Roman" font-size="10pt" color="#000000" border-top="0.75pt solid #000000" padding-top="4pt">
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-column column-width="proportional-column-width(1)"/>
<fo:table-body>
<fo:table-row>
<fo:table-cell padding-top="5pt">
<fo:block text-align="left" font-weight="bold" font-style="italic"> GFK &amp; ASSOCIATES, INC </fo:block>
</fo:table-cell>
<fo:table-cell padding-top="5pt">
<fo:block text-align="center" font-weight="bold" font-style="italic"> Geotechnical Consultants </fo:block>
</fo:table-cell>
<fo:table-cell padding-top="5pt">
<fo:block text-align="right" font-weight="bold">
Page
<xsl:value-of select="$page-prefix"/>
<fo:page-number/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-body>
</fo:table>
</fo:static-content>
</xsl:template>
<!--   smallcaps template   -->
<xsl:template name="smallCaps">
<xsl:param name="text"/>
<xsl:if test="string-length($text) > 0">
<xsl:choose>
<!--   Process each word separately   -->
<xsl:when test="contains($text, ' ')">
<xsl:call-template name="smallCapsWord">
<xsl:with-param name="word" select="substring-before($text, ' ')"/>
</xsl:call-template>
<xsl:text> </xsl:text>
<xsl:call-template name="smallCaps">
<xsl:with-param name="text" select="substring-after($text, ' ')"/>
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
<xsl:if test="string-length($word) > 0">
<fo:inline font-family="Times New Roman" font-size="80%">
<fo:inline font-size="125%">
<xsl:value-of select="translate( substring($word, 1, 1), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:inline>
<xsl:value-of select="translate( substring($word, 2), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:inline>
</xsl:if>
</xsl:template>
<!--   One top-level section typed appendix owns A, B, C...
     Its children each create an individual page sequence; first resets page number to 1.
     The first child also carries the appendix TOC destination, avoiding a blank cover.   -->
<xsl:template match="section" mode="appendix">
<xsl:variable name="letter">
<xsl:number level="single" count="section[normalize-space(type) = 'appendix' or normalize-space(type) = 'boringlog' or normalize-space(type) = 'figure' or normalize-space(type) = 'labsummary']" format="A"/>
</xsl:variable>
<xsl:choose>
<!--   Optional top-level boringlog: treated as one-log appendix   -->
<xsl:when test="normalize-space(type) = 'boringlog'">
<xsl:apply-templates select="." mode="appendix-item">
<xsl:with-param name="appendix-letter" select="$letter"/>
<xsl:with-param name="first-in-appendix" select="true()"/>
<xsl:with-param name="appendix-id" select="''"/>
</xsl:apply-templates>
</xsl:when>
<xsl:when test="normalize-space(type) = 'labsummary'">
<xsl:apply-templates select="." mode="appendix-item">
<xsl:with-param name="appendix-letter" select="$letter"/>
<xsl:with-param name="first-in-appendix" select="true()"/>
<xsl:with-param name="appendix-id" select="''"/>
</xsl:apply-templates>
</xsl:when>
<xsl:when test="normalize-space(type) = 'figure'">
<xsl:apply-templates select="." mode="appendix-item">
<xsl:with-param name="appendix-letter" select="$letter"/>
<xsl:with-param name="first-in-appendix" select="true()"/>
<xsl:with-param name="appendix-id" select="''"/>
</xsl:apply-templates>
</xsl:when>
<xsl:when test="subsections/section">
<xsl:for-each select="subsections/section">
<xsl:apply-templates select="." mode="appendix-item">
<xsl:with-param name="appendix-letter" select="$letter"/>
<xsl:with-param name="first-in-appendix" select="position() = 1"/>
<xsl:with-param name="appendix-id">
<xsl:if test="position() = 1">
<xsl:value-of select="generate-id(../..)"/>
</xsl:if>
</xsl:with-param>
</xsl:apply-templates>
</xsl:for-each>
</xsl:when>
<xsl:otherwise>
<xsl:call-template name="appendixTextPage">
<xsl:with-param name="appendix-letter" select="$letter"/>
<xsl:with-param name="first-in-appendix" select="true()"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="title-text" select="title"/>
<xsl:with-param name="content-text" select="content"/>
</xsl:call-template>
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--   Resolve references from /report/borings/boring using the original boringid   -->
<xsl:template match="section[normalize-space(type)='boringlog']" mode="appendix-item">
<xsl:param name="appendix-letter"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:variable name="bid" select="normalize-space(referenceid)"/>
<xsl:variable name="boring" select="key('boring-by-id', $bid)"/>
<xsl:choose>
<xsl:when test="$boring">
<xsl:call-template name="renderBoringLog">
<xsl:with-param name="boring" select="$boring[1]"/>
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
</xsl:call-template>
</xsl:when>
<xsl:otherwise>
<xsl:call-template name="appendixTextPage">
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="title-text" select="title"/>
<xsl:with-param name="content-text" select="concat('Boring log not found. Reference ID: ', $bid)"/>
</xsl:call-template>
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--  Unassigned/other appendix items are draft text pages. Lab summary is reserved for later.  -->
<xsl:template match="section" mode="appendix-item">
<xsl:param name="appendix-letter"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:call-template name="appendixTextPage">
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="title-text" select="title"/>
<xsl:with-param name="content-text" select="content"/>
</xsl:call-template>
</xsl:template>
<xsl:template name="appendixTextPage">
<xsl:param name="appendix-letter"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:param name="section-id" select="''"/>
<xsl:param name="title-text" select="''"/>
<xsl:param name="content-text" select="''"/>
<fo:page-sequence master-reference="report-page" format="1" force-page-count="no-force">
<xsl:attribute name="initial-page-number">
<xsl:choose>
<xsl:when test="$first-in-appendix">1</xsl:when>
<xsl:otherwise>auto</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<xsl:call-template name="reportHeader"/>
<xsl:call-template name="reportFooter">
<xsl:with-param name="page-prefix" select="$appendix-letter"/>
</xsl:call-template>
<fo:flow flow-name="xsl-region-body">
<xsl:if test="normalize-space($appendix-id) != ''">
<fo:block id="{$appendix-id}" font-size="0pt" line-height="0pt"/>
</xsl:if>
<fo:block id="{$section-id}" font-size="14pt" font-weight="bold" space-after="12pt">
<xsl:value-of select="$title-text"/>
</fo:block>
<xsl:if test="string($content-text)">
<fo:block font-size="10pt" line-height="14pt" linefeed-treatment="preserve" white-space-collapse="false">
<xsl:value-of select="$content-text"/>
</fo:block>
</xsl:if>
</fo:flow>
</fo:page-sequence>
</xsl:template>
<!--  Figure sheets integrate the exact fixed layout from GFK Figure Stylesheet v4.  -->
<xsl:template name="renderFigureSheet">
<xsl:param name="figure" select="/report/figures/figure[false()]"/>
<xsl:param name="section-title" select="''"/>
<xsl:param name="section-id" select="''"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:param name="appendix-letter" select="''"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:for-each select="$figure">
<xsl:variable name="orientation">
<xsl:choose>
<xsl:when test="translate(normalize-space(orientation), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'landscape'">landscape</xsl:when>
<xsl:otherwise>portrait</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="frameWidth">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">10in</xsl:when>
<xsl:otherwise>7.5in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="frameHeight">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">7.5in</xsl:when>
<xsl:otherwise>10in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="innerWidth">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">9.7in</xsl:when>
<xsl:otherwise>7.2in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="footerTop">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">6.5in</xsl:when>
<xsl:otherwise>9in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="row2Top">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">6.75in</xsl:when>
<xsl:otherwise>9.25in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="row3Top">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">7.5in</xsl:when>
<xsl:otherwise>10in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="rightStart">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">5.5in</xsl:when>
<xsl:otherwise>4.25in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="halfWidth">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">5in</xsl:when>
<xsl:otherwise>3.75in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="col2Start">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">7.166667in</xsl:when>
<xsl:otherwise>5.5in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="col3Start">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">8.833333in</xsl:when>
<xsl:otherwise>6.75in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="colWidth">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">1.666667in</xsl:when>
<xsl:otherwise>1.25in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="imageHeight">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">5.0in</xsl:when>
<xsl:otherwise>7.5in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="captionTop">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">6in</xsl:when>
<xsl:otherwise>8.5in</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<fo:page-sequence master-reference="figure-{$orientation}" format="1" force-page-count="no-force">
<xsl:attribute name="initial-page-number">
<xsl:choose>
<xsl:when test="$first-in-appendix">1</xsl:when>
<xsl:otherwise>auto</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<fo:flow flow-name="xsl-region-body">
<xsl:if test="normalize-space($appendix-id) != ''">
<fo:block id="{$appendix-id}" font-size="0pt" line-height="0pt"/>
</xsl:if>
<fo:block id="{$section-id}" font-size="0pt" line-height="0pt"/>
<!--   Continuous outer border: 0.5in inside all page edges.   -->
<fo:block-container absolute-position="absolute" top="0.5in" left="0.5in" width="{$frameWidth}" height="{$frameHeight}" border="0.75pt solid black">
<fo:block/>
</fo:block-container>
<!--   Image fills most of the area above the fixed footer.   -->
<fo:block-container absolute-position="absolute" top="0.72in" left="0.65in" width="{$innerWidth}" height="{$imageHeight}" display-align="center">
<fo:block text-align="center">
<xsl:choose>
<xsl:when test="normalize-space(imageurl) != ''">
<fo:external-graphic content-width="scale-to-fit" content-height="scale-to-fit" scaling="uniform" width="{$innerWidth}" height="{$imageHeight}">
<xsl:attribute name="src">
<xsl:text>url('</xsl:text>
<xsl:value-of select="normalize-space(imageurl)"/>
<xsl:text>')</xsl:text>
</xsl:attribute>
</fo:external-graphic>
</xsl:when>
<xsl:otherwise>
<fo:inline color="#777777" font-size="12pt"> Image not available </fo:inline>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:block-container>
<!--   Figure caption is above, not inside, the footer.   -->
<fo:block-container absolute-position="absolute" top="{$captionTop}" left="0.65in" width="{$innerWidth}" height="0.35in" display-align="center">
<fo:block text-align="center" font-size="12pt" line-height="14pt">
<xsl:value-of select="figurecaption"/>
</fo:block>
</fo:block-container>
<!--   Fixed footer: 1.5in total = 0.25 + 0.75 + 0.5.
                         Draw rules separately to avoid table row minimum-height expansion.   -->
<fo:block-container absolute-position="absolute" top="{$footerTop}" left="0.5in" width="{$frameWidth}" height="0.01in" border-top="0.75pt solid black">
<fo:block/>
</fo:block-container>
<!--   50/50 division between company logo and title block.
                         Inset ~0.005in at either end so line cannot cross the frame.   -->
<fo:block-container absolute-position="absolute" top="{$footerTop}" left="{$rightStart}" width="0.01in" height="1.49in" border-left="0.75pt solid black">
<fo:block/>
</fo:block-container>
<!--   Left half logo: reserved full footer height.   -->
<fo:block-container absolute-position="absolute" top="{$footerTop}" left="0.62in" height="1.48in" display-align="center">
<xsl:attribute name="width">
<xsl:choose>
<xsl:when test="$orientation = 'landscape'">4.76in</xsl:when>
<xsl:otherwise>3.51in</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<fo:block text-align="center">
<xsl:choose>
<xsl:when test="normalize-space(/report/logourl) != ''">
<fo:external-graphic content-width="scale-to-fit" content-height="scale-to-fit" scaling="uniform" width="100%" height="1.28in">
<xsl:attribute name="src">
<xsl:text>url('</xsl:text>
<xsl:value-of select="normalize-space(/report/logourl)"/>
<xsl:text>')</xsl:text>
</xsl:attribute>
</fo:external-graphic>
</xsl:when>
<xsl:otherwise>
<fo:inline font-weight="normal" font-size="12pt">GFK &amp; ASSOCIATES, INC</fo:inline>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:block-container>
<!--   Horizontal dividers within right half at 0.25in and 1.0in.   -->
<fo:block-container absolute-position="absolute" top="{$row2Top}" left="{$rightStart}" width="{$halfWidth}" height="0.01in" border-top="0.75pt solid black">
<fo:block/>
</fo:block-container>
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$rightStart}" width="{$halfWidth}" height="0.01in" border-top="0.75pt solid black">
<fo:block/>
</fo:block-container>
<!--   ROW 1 (0.25in): figure title   -->
<fo:block-container absolute-position="absolute" top="{$footerTop}" left="{$rightStart}" width="{$halfWidth}" height="0.25in" display-align="center">
<fo:block font-size="14pt" font-weight="bold" line-height="16pt" text-align="center" margin-left="5pt" margin-right="5pt">
<xsl:choose>
<xsl:when test="normalize-space(figuretitle) != ''">
<xsl:value-of select="translate(figuretitle, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</xsl:when>
<xsl:otherwise>
<xsl:value-of select="translate($section-title, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</xsl:otherwise>
</xsl:choose>
</fo:block>
</fo:block-container>
<!--   ROW 2 (0.75in): project title, address, city (three lines, 12pt / 14pt leading).   -->
<fo:block-container absolute-position="absolute" top="{$row2Top}" left="{$rightStart}" width="{$halfWidth}" height="0.75in" display-align="center">
<fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt" font-weight="normal">
<xsl:value-of select="/report/projecttitle"/>
</fo:block>
<fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt">
<xsl:value-of select="/report/projectaddress"/>
</fo:block>
<fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt">
<xsl:value-of select="/report/projectcity"/>
</fo:block>
</fo:block-container>
<!--   ROW 3 (0.5in): three fixed-width columns, no tables.   -->
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col2Start}" width="0.01in" height="0.49in" border-left="0.75pt solid black">
<fo:block/>
</fo:block-container>
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col3Start}" width="0.01in" height="0.49in" border-left="0.75pt solid black">
<fo:block/>
</fo:block-container>
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$rightStart}" width="{$colWidth}" height="0.5in" display-align="center">
<fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="normal">PROJECT NO.</fo:block>
<fo:block text-align="center" font-size="12pt" line-height="14pt">
<xsl:value-of select="/report/projectnumber"/>
</fo:block>
</fo:block-container>
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col2Start}" width="{$colWidth}" height="0.5in" display-align="center">
<fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="normal">DATE</fo:block>
<fo:block text-align="center" font-size="12pt" line-height="14pt">
<!--   Empty until the figure is integrated into a report.   -->
<xsl:value-of select="/report/datereport"/>
</fo:block>
</fo:block-container>
<fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col3Start}" width="{$colWidth}" height="0.5in" display-align="center">
<fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="normal">PAGE</fo:block>
<fo:block text-align="center" font-size="12pt" line-height="14pt">
<xsl:value-of select="$appendix-letter"/>
<fo:page-number/>
</fo:block>
</fo:block-container>
<!--   Required flowing block; all actual content is positioned.   -->
<fo:block/>
</fo:flow>
</fo:page-sequence>
</xsl:for-each>
</xsl:template>
<!--  Figure appendix items: resolve /report/figures/figure by referenceid.  -->
<xsl:template match="section[normalize-space(type)='figure']" mode="appendix-item">
<xsl:param name="appendix-letter"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:variable name="fid" select="normalize-space(referenceid)"/>
<xsl:variable name="figure" select="key('figure-by-id', $fid)"/>
<xsl:choose>
<xsl:when test="$fid != '' and $figure">
<xsl:call-template name="renderFigureSheet">
<xsl:with-param name="figure" select="$figure[1]"/>
<xsl:with-param name="section-title" select="title"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
</xsl:call-template>
</xsl:when>
<xsl:otherwise>
<!--   Draft figures without an assigned reference still retain TOC destinations.   -->
<xsl:call-template name="appendixTextPage">
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
<xsl:with-param name="section-id" select="generate-id()"/>
<xsl:with-param name="title-text" select="title"/>
<xsl:with-param name="content-text" select="concat('Figure not assigned or not found. Reference ID: ', $fid)"/>
</xsl:call-template>
</xsl:otherwise>
</xsl:choose>
</xsl:template>
<!--  Spectral response: type-based, no fabricated seismic values.  -->
<xsl:template match="section[normalize-space(type)='spectralresponse']" mode="body">
<xsl:param name="depth" select="1"/>
<!--   Section heading   -->
<fo:block id="{generate-id()}" space-after="5pt" keep-with-next.within-page="always">
<xsl:attribute name="space-before">
<xsl:choose>
<xsl:when test="$depth = 1">14pt</xsl:when>
<xsl:otherwise>9pt</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<fo:inline font-family="Times New Roman" font-size="10pt" font-weight="bold" color="#000000" text-decoration="underline">
<xsl:call-template name="sectionNumber"/>
.
<xsl:text> </xsl:text>
<xsl:value-of select="translate(title, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
</fo:inline>
</fo:block>
<!--   Section content   -->
<xsl:if test="string(content)">
<fo:block font-family="Times New Roman" font-size="10pt" line-height="14pt" space-after="7pt" text-align="justify" white-space-collapse="false" linefeed-treatment="preserve" wrap-option="wrap">
<xsl:value-of select="content"/>
</fo:block>
</xsl:if>
<xsl:if test="normalize-space(imageurl) != ''">
<fo:block space-before="8pt" space-after="8pt" text-align="center">
<fo:external-graphic src="{imageurl}" content-width="scale-to-fit" content-height="scale-to-fit" width="6.3in" height="4in" scaling="uniform"/>
</fo:block>
</xsl:if>
<xsl:apply-templates select="subsections/section" mode="body">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<!--  Optional inline figures, when a figure section is outside an appendix.  -->
<xsl:template match="section[normalize-space(type)='figure']" mode="body">
<xsl:param name="depth" select="1"/>
<xsl:variable name="fid" select="normalize-space(referenceid)"/>
<xsl:variable name="figure" select="key('figure-by-id', $fid)"/>
<fo:block id="{generate-id()}" font-size="10pt" font-weight="bold" text-decoration="underline" space-before="10pt" space-after="7pt" keep-with-next.within-page="always">
<xsl:call-template name="sectionNumber"/>
<xsl:text>. </xsl:text>
<xsl:value-of select="title"/>
</fo:block>
<xsl:choose>
<xsl:when test="$figure[1]/imageurl != ''">
<fo:block text-align="center" space-after="7pt">
<fo:external-graphic src="{$figure[1]/imageurl}" width="6.1in" height="7in" content-width="scale-to-fit" content-height="scale-to-fit" scaling="uniform"/>
</fo:block>
<xsl:if test="normalize-space($figure[1]/figurecaption) != ''">
<fo:block text-align="center" font-size="10pt" space-after="8pt">
<xsl:value-of select="$figure[1]/figurecaption"/>
</fo:block>
</xsl:if>
</xsl:when>
<xsl:otherwise>
<fo:block font-style="italic" font-size="10pt">Figure not assigned or not found.</fo:block>
</xsl:otherwise>
</xsl:choose>
<xsl:apply-templates select="subsections/section" mode="body">
<xsl:with-param name="depth" select="$depth + 1"/>
</xsl:apply-templates>
</xsl:template>
<xsl:template match="section[normalize-space(type)='labsummary']" mode="appendix-item" priority="3">
<xsl:param name="appendix-letter"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:call-template name="renderLabSummary">
<xsl:with-param name="appendix-letter" select="$appendix-letter"/>
<xsl:with-param name="first-in-appendix" select="$first-in-appendix"/>
<xsl:with-param name="appendix-id" select="$appendix-id"/>
<xsl:with-param name="section-id" select="generate-id()"/>
</xsl:call-template>
</xsl:template>
<xsl:template name="renderLabSummary">
<xsl:param name="appendix-letter" select="'A'"/>
<xsl:param name="first-in-appendix" select="false()"/>
<xsl:param name="appendix-id" select="''"/>
<xsl:param name="section-id" select="''"/>
<fo:page-sequence master-reference="labsummary-page" format="1" force-page-count="no-force">
<xsl:attribute name="initial-page-number">
<xsl:choose>
<xsl:when test="$first-in-appendix">1</xsl:when>
<xsl:otherwise>auto</xsl:otherwise>
</xsl:choose>
</xsl:attribute>
<xsl:call-template name="reportHeader">
<xsl:with-param name="middle-width" select="'5in'"/>
</xsl:call-template>
<xsl:call-template name="reportFooter">
<xsl:with-param name="page-prefix" select="$appendix-letter"/>
</xsl:call-template>
<fo:flow flow-name="xsl-region-body">
<xsl:if test="normalize-space($appendix-id) != ''">
<fo:block id="{$appendix-id}" font-size="0pt" line-height="0pt"/>
</xsl:if>
<fo:block id="{$section-id}" font-size="0pt" line-height="0pt"/>
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
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Sample No</fo:block>
</fo:table-cell>
<fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Depth (ft)</fo:block>
</fo:table-cell>
<fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Dry Density (pcf)</fo:block>
</fo:table-cell>
<fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-bottom="3pt double #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Moisture Content % </fo:block>
</fo:table-cell>
<!--  Span 5 & 6 → Atterberg Limits  -->
<fo:table-cell number-columns-spanned="2" border="0.5pt solid #000000" border-top="3pt double #000000" display-align="center" border-bottom="0.5pt solid #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Atterberg Limits</fo:block>
</fo:table-cell>
<!--  Span 7 & 8 → Unconfined Compression  -->
<fo:table-cell number-columns-spanned="2" border="0.5pt solid #000000" border-top="3pt double #000000" display-align="center" border-bottom="0.5pt solid #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Unconfined Compression</fo:block>
</fo:table-cell>
<!--  Row-spanning column 9  -->
<fo:table-cell number-rows-spanned="2" border="0.5pt solid #000000" display-align="center" border-top="3pt double #000000" border-right="3pt double #000000" border-bottom="3pt double #000000">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Sieve Analysis</fo:block>
</fo:table-cell>
</fo:table-row>
<!--  ======================  -->
<!--  HEADER ROW 2 (normal)   -->
<!--  ======================  -->
<fo:table-row height="0.5in">
<!--  These two cells sit under the 5–6 span  -->
<fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Liquid Limit %</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Plastic Index</fo:block>
</fo:table-cell>
<!--  These two cells sit under the 7–8 span  -->
<fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Strength (psf)</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid #000000" border-top="0.5pt solid #000000" border-bottom="3pt double #000000" display-align="center">
<fo:block text-align="center" font-weight="bold" line-height="12pt" font-size="10pt">Strain %</fo:block>
</fo:table-cell>
</fo:table-row>
</fo:table-header>
<!--  ======================  -->
<!--          BODY            -->
<!--  ======================  -->
<fo:table-body>
<xsl:choose>
<xsl:when test="/report/labsummary/sample">
<xsl:for-each select="/report/labsummary/sample">
<fo:table-row height="0.35in">
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="sampleno"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="depth"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="dryden"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="moist"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="ll"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="pi"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="un"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="strain"/>
</fo:block>
</fo:table-cell>
<fo:table-cell border="0.5pt solid black" display-align="center" text-align="center">
<fo:block font-size="10pt">
<xsl:value-of select="sieve"/>
</fo:block>
</fo:table-cell>
</fo:table-row>
</xsl:for-each>
</xsl:when>
<xsl:otherwise>
<fo:table-row>
<fo:table-cell number-columns-spanned="9" border="0.5pt solid black" padding="8pt">
<fo:block font-size="10pt" font-style="italic" text-align="center">No laboratory test results available.</fo:block>
</fo:table-cell>
</fo:table-row>
</xsl:otherwise>
</xsl:choose>
</fo:table-body>
</fo:table>
</fo:flow>
</fo:page-sequence>
</xsl:template>
</xsl:stylesheet>