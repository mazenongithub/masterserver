<?xml version='1.0' encoding='UTF-8'?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0"><xsl:param name="logo-uri" select="''"/>
<xsl:variable name="ppf" select="14.4"/>
<xsl:variable name="grid-feet" select="36.4"/>
<xsl:variable name="grid-height" select="$grid-feet * $ppf"/>
<!-- Called inside fo:layout-master-set by standalone and combined report. -->
<xsl:template name="boring-page-master"><fo:simple-page-master master-name="boring-page" page-width="8.5in" page-height="11in" margin-top="0.25in" margin-bottom="0.30in" margin-left="0.30in" margin-right="0.30in">
                <fo:region-body margin-top="1.25in" margin-bottom="1.625in"/>
                <fo:region-before extent="1.25in"/><fo:region-after extent="1.625in"/>
            </fo:simple-page-master></xsl:template>
<xsl:template name="boringHeader"><xsl:param name="appendix-letter" select="''"/><fo:static-content flow-name="xsl-region-before">
                    <fo:block-container width="7.9in" height="1.25in" border="0.8pt solid black" padding="0.03in">
                        <fo:table table-layout="fixed" width="100%">
                            <fo:table-column column-width="1.05in"/><fo:table-column column-width="5.80in"/><fo:table-column column-width="1.00in"/>
                            <fo:table-body>
                                <fo:table-row height="0.30in">
                                    <fo:table-cell><fo:block font-family="Times New Roman" font-size="8pt">Proj. No.</fo:block><fo:block font-family="Times New Roman" font-size="9pt" font-weight="bold"><xsl:value-of select="(/report/projectnumber | /log/project/projectnumber)[1]"/></fo:block></fo:table-cell>
                                    <fo:table-cell><fo:block text-align="center" font-family="Times New Roman" font-size="11pt" font-weight="bold"><xsl:value-of select="(/report/projecttitle | /log/project/title)[1]"/></fo:block><fo:block text-align="center" font-family="Times New Roman" font-size="9pt"><xsl:value-of select="(/report/projectaddress | /log/project/projectaddress)[1]"/><xsl:if test="/report/projectcity or /log/project/projectcity"><xsl:text>, </xsl:text><xsl:value-of select="(/report/projectcity | /log/project/projectcity)[1]"/></xsl:if></fo:block></fo:table-cell>
                                    <fo:table-cell><fo:block text-align="right" font-family="Times New Roman" font-size="8pt">Boring</fo:block><fo:block text-align="right" font-family="Times New Roman" font-size="10pt" font-weight="bold"><xsl:value-of select="boringnumber"/></fo:block></fo:table-cell>
                                </fo:table-row>
                                <fo:table-row height="0.27in"><fo:table-cell number-columns-spanned="3"><fo:block text-align="center" font-family="Times New Roman" font-size="11pt" font-weight="bold" space-before="2pt">EXPLORATORY BORING LOG<xsl:if test="normalize-space($appendix-letter) != ''"><xsl:text> - APPENDIX </xsl:text><xsl:value-of select="$appendix-letter"/></xsl:if></fo:block></fo:table-cell></fo:table-row>
                                <fo:table-row><fo:table-cell number-columns-spanned="3"><fo:table table-layout="fixed" width="100%">
                                    <fo:table-column column-width="proportional-column-width(1)"/><fo:table-column column-width="proportional-column-width(1)"/><fo:table-column column-width="proportional-column-width(1)"/><fo:table-column column-width="proportional-column-width(1)"/>
                                    <fo:table-body>
                                        <fo:table-row>
                                            <fo:table-cell><fo:block font-size="7pt">Date Drilled: <xsl:value-of select="datedrilled"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Logged By: <xsl:value-of select="loggedby"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Drill Rig: <xsl:value-of select="drillrig"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Diameter: <xsl:value-of select="diameter"/></fo:block></fo:table-cell>
                                        </fo:table-row><fo:table-row>
                                            <fo:table-cell><fo:block font-size="7pt">Elevation: <xsl:value-of select="elevation"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Groundwater: <xsl:value-of select="gwdepth"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Latitude: <xsl:value-of select="latitude"/></fo:block></fo:table-cell>
                                            <fo:table-cell><fo:block font-size="7pt">Longitude: <xsl:value-of select="longitude"/></fo:block></fo:table-cell>
                                        </fo:table-row></fo:table-body></fo:table></fo:table-cell></fo:table-row>
                            </fo:table-body></fo:table></fo:block-container>
                </fo:static-content>
                </xsl:template><xsl:template name="boringFooter"><xsl:param name="appendix-letter" select="''"/><fo:static-content flow-name="xsl-region-after">
                    <fo:block-container width="7.90in" height="1.625in" border="0.8pt solid black">
                        <fo:block font-family="Times New Roman" font-size="8pt" text-align="center" color="#999999" padding-top="0.50in">PROJECT FOOTER / GFK LOGO — RESERVED 1.625 INCHES</fo:block>
                    <fo:block font-family="Times New Roman" font-size="9pt" font-weight="bold" text-align="right" padding-right="0.13in" space-before="0.14in"><xsl:if test="normalize-space($appendix-letter) != ''"><xsl:text>Page </xsl:text><xsl:value-of select="$appendix-letter"/><fo:page-number/></xsl:if></fo:block></fo:block-container>
                </fo:static-content>
                
                </xsl:template><xsl:template name="page">
        <xsl:param name="page-start"/><xsl:param name="max-depth"/>
        <xsl:variable name="page-end" select="$page-start + $grid-feet"/>
        <xsl:if test="$page-start &gt; 0"><fo:block break-before="page" font-size="0pt" line-height="0pt"/></xsl:if>
        <!-- A single physical-height grid: no table rows can expand or shift the depth scale. -->
        <fo:block-container width="568.8pt" height="{$grid-height + 20}pt" position="relative" overflow="hidden">
            <fo:block font-size="0pt" line-height="0pt" space-before="0pt" space-after="0pt">
                <fo:instream-foreign-object content-width="568.8pt" content-height="{$grid-height + 20}pt">
                    <svg:svg width="568.8pt" height="{$grid-height + 20}pt" viewBox="0 0 568.8 {$grid-height + 20}">
                        <svg:rect x="0.5" y="0.5" width="567.8" height="{$grid-height + 19}" fill="white" stroke="black" stroke-width="0.8"/>
                        <svg:rect x="0.5" y="0.5" width="567.8" height="19.5" fill="#e8e8e8"/>
                        <svg:line x1="0" y1="20" x2="568.8" y2="20" stroke="black" stroke-width="0.8"/>
                        <!-- Graphic soil profile: each image fills upward to the preceding sample WITH an image (or zero).
     Clip to the current page and draw BEFORE grid lines, so column borders remain visible. -->
                        <xsl:for-each select="samples/sample[normalize-space(graphiclog) != '']">
                            <xsl:variable name="sample-depth" select="number(depth)"/>
                            <xsl:variable name="prior-depth">
                                <xsl:choose>
                                    <xsl:when test="preceding-sibling::sample[normalize-space(graphiclog) != '']"><xsl:value-of select="number(preceding-sibling::sample[normalize-space(graphiclog) != ''][1]/depth)"/></xsl:when>
                                    <xsl:otherwise>0</xsl:otherwise>
                                </xsl:choose>
                            </xsl:variable>
                            <xsl:variable name="start-depth">
                                <xsl:choose><xsl:when test="number($prior-depth) &gt; $page-start"><xsl:value-of select="$prior-depth"/></xsl:when><xsl:otherwise><xsl:value-of select="$page-start"/></xsl:otherwise></xsl:choose>
                            </xsl:variable>
                            <xsl:variable name="end-depth">
                                <xsl:choose><xsl:when test="$sample-depth &lt; $page-end"><xsl:value-of select="$sample-depth"/></xsl:when><xsl:otherwise><xsl:value-of select="$page-end"/></xsl:otherwise></xsl:choose>
                            </xsl:variable>
                            <xsl:if test="$sample-depth &gt; $page-start and number($prior-depth) &lt; $page-end and number($end-depth) &gt; number($start-depth)">
                                <!-- One square repeat tile is 50.4pt (the column width). The source image
         retains its aspect ratio; excess is cropped instead of distorted. -->
                                <xsl:variable name="pattern-id" select="concat('soil-', generate-id(), '-', format-number($page-start, '0'))"/>
                                <svg:defs>
                                    <svg:pattern id="{$pattern-id}" patternUnits="userSpaceOnUse" x="92.16" y="20" width="50.4" height="50.4">
                                        <svg:image x="0" y="0" width="50.4" height="50.4" preserveAspectRatio="xMidYMid slice" xlink:href="{normalize-space(graphiclog)}"/>
                                    </svg:pattern>
                                </svg:defs>
                                <svg:rect x="92.16" y="{20 + (number($start-depth) - $page-start)*$ppf}" width="50.4" height="{(number($end-depth) - number($start-depth))*$ppf}" fill="url(#{$pattern-id})"/>
                            </xsl:if>
                        </xsl:for-each>
                        <!-- Vertical column boundaries, including the full-height ruler. -->
                        <xsl:call-template name="grid-columns"><xsl:with-param name="i" select="1"/></xsl:call-template>
                        <!-- Tick coordinates and sample boundaries share this SVG origin, y=20pt. -->
                        <xsl:call-template name="grid-ticks"><xsl:with-param name="foot" select="floor($page-start) + 1"/><xsl:with-param name="page-start" select="$page-start"/></xsl:call-template>
                        <xsl:for-each select="samples/sample[number(depth) &gt;= $page-start and number(depth) &lt; $page-end and (linebreak='true' or linebreak='1')]">
                            <svg:line x1="32.4" x2="568.8" y1="{20 + (number(depth) - $page-start)*$ppf}" y2="{20 + (number(depth) - $page-start)*$ppf}" stroke="black" stroke-width="0.8"/>
                        </xsl:for-each>
                        <xsl:if test="$max-depth &gt;= $page-start and $max-depth &lt;= $page-end">
                            <svg:line x1="32.4" x2="568.8" y1="{20 + ($max-depth - $page-start)*$ppf}" y2="{20 + ($max-depth - $page-start)*$ppf}" stroke="black" stroke-width="1"/>
                        </xsl:if>
                        <svg:line x1="0" x2="32.4" y1="{$grid-height + 20}" y2="{$grid-height + 20}" stroke="black" stroke-width="0.8"/>
                        <!-- Column headings -->
                        <svg:g font-family="Times New Roman" font-size="6.2" font-weight="bold" text-anchor="middle">
                            <svg:text x="16.2" y="13">Depth</svg:text><svg:text x="46.8" y="13">Sample</svg:text><svg:text x="76.7" y="13">Type</svg:text>
                            <svg:text x="117.4" y="13">Graphic</svg:text><svg:text x="241.6" y="13">Description</svg:text>
                            <svg:text x="355.7" y="13">USCS</svg:text><svg:text x="387" y="13">SPT</svg:text>
                            <svg:text x="420.5" y="10">Dry</svg:text><svg:text x="420.5" y="17">Density</svg:text>
                            <svg:text x="455" y="10">Moisture</svg:text><svg:text x="455" y="17">%</svg:text>
                            <svg:text x="520.4" y="13">Remarks</svg:text>
                        </svg:g>
                    </svg:svg>
                </fo:instream-foreign-object></fo:block>
            <!-- Sample text is absolutely positioned; its content cannot stretch the grid. -->
            <xsl:for-each select="samples/sample[number(depth) &gt;= $page-start and number(depth) &lt; $page-end]">
                <xsl:variable name="depth" select="number(depth)"/>
                <xsl:variable name="y" select="20 + ($depth - $page-start)*$ppf"/>
                <xsl:variable name="next-depth" select="number(following-sibling::sample[1]/depth)"/>
                <xsl:variable name="is-last" select="not(following-sibling::sample)"/>
                <!-- Position sample text 4.5pt lower than the previous version.
     The depth-zero label remains at the grid origin to prevent clipping. -->
                <xsl:variable name="data-y">
                    <xsl:choose>
                        <xsl:when test="$depth = $page-start"><xsl:value-of select="$y"/></xsl:when>
                        <xsl:otherwise><xsl:value-of select="$y - 8"/></xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:call-template name="sample-data"><xsl:with-param name="y" select="number($data-y)"/><xsl:with-param name="height" select="10.5"/></xsl:call-template>
            </xsl:for-each>
            <!-- Groundwater note, only if depth is supplied and numeric. -->
            <xsl:variable name="gw" select="number(gwdepth)"/>
            <xsl:if test="normalize-space(gwdepth)!='' and $gw=$gw and $gw &gt;= $page-start and $gw &lt; $page-end">
                <fo:block-container absolute-position="absolute" top="{20 + ($gw - $page-start)*$ppf + 1}pt" left="474pt" width="93.8pt" height="11pt" overflow="hidden">
                    <fo:block font-family="Times New Roman" font-size="7pt" line-height="9pt">Groundwater at <xsl:value-of select="format-number($gw,'0.##')"/> feet</fo:block></fo:block-container>
            </xsl:if>
            <xsl:if test="$max-depth &gt;= $page-start and $max-depth &lt; $page-end">
                <fo:block-container absolute-position="absolute" top="{20 + ($max-depth - $page-start)*$ppf + 2}pt" left="52pt" width="495.8pt" height="14pt" overflow="hidden" background-color="white">
                    <fo:block font-family="Times New Roman" font-size="8pt" font-weight="bold" text-align="center" line-height="11pt">Bottom of boring at <xsl:value-of select="format-number($max-depth,'0.##')"/> ft<xsl:if test="normalize-space(gwdepth)=''">. Groundwater not encountered.</xsl:if></fo:block>
                </fo:block-container>
            </xsl:if>
        </fo:block-container>
        <xsl:if test="$max-depth &gt; $page-end"><xsl:call-template name="page"><xsl:with-param name="page-start" select="$page-end"/><xsl:with-param name="max-depth" select="$max-depth"/></xsl:call-template></xsl:if>
    </xsl:template>
    <xsl:template name="grid-columns">
        <xsl:param name="i"/>
        <xsl:variable name="positions" select="'32.4 61.2 92.16 142.56 340.56 370.8 403.2 437.76 472.32'"/>
        <xsl:choose>
            <xsl:when test="$i=1"><svg:line x1="32.4" x2="32.4" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=2"><svg:line x1="61.2" x2="61.2" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=3"><svg:line x1="92.16" x2="92.16" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=4"><svg:line x1="142.56" x2="142.56" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=5"><svg:line x1="340.56" x2="340.56" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=6"><svg:line x1="370.8" x2="370.8" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=7"><svg:line x1="403.2" x2="403.2" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=8"><svg:line x1="437.76" x2="437.76" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
            <xsl:when test="$i=9"><svg:line x1="472.32" x2="472.32" y1="0" y2="{$grid-height + 20}" stroke="black" stroke-width="0.6"/></xsl:when>
        </xsl:choose>
        <xsl:if test="$i &lt; 9"><xsl:call-template name="grid-columns"><xsl:with-param name="i" select="$i+1"/></xsl:call-template></xsl:if>
    </xsl:template>
    <xsl:template name="grid-ticks"><xsl:param name="foot"/><xsl:param name="page-start"/>
        <xsl:if test="$foot &lt;= $page-start + $grid-feet">
            <xsl:variable name="d" select="$foot"/><xsl:variable name="y" select="20 + ($foot - $page-start)*$ppf"/>
            <svg:line x1="0" x2="6" y1="{$y}" y2="{$y}" stroke="black" stroke-width="0.65"/>
            <svg:line x1="26" x2="32" y1="{$y}" y2="{$y}" stroke="black" stroke-width="0.65"/>
            <svg:rect x="7" y="{$y - 5}" width="18" height="10" fill="white"/>
            <svg:text x="16" y="{$y + 2.2}" font-family="Times New Roman" font-size="6" text-anchor="middle"><xsl:if test="$d mod 5=0"><xsl:attribute name="font-weight">bold</xsl:attribute></xsl:if><xsl:value-of select="format-number($d,'0.##')"/></svg:text>
            <xsl:call-template name="grid-ticks"><xsl:with-param name="foot" select="$foot+1"/><xsl:with-param name="page-start" select="$page-start"/></xsl:call-template>
        </xsl:if></xsl:template>
    <xsl:template name="sample-data"><xsl:param name="y"/><xsl:param name="height"/>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="33"/><xsl:with-param name="w" select="27"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="samplenumber"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="62"/><xsl:with-param name="w" select="29"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="sampleset"/></xsl:call-template>
        <!-- Graphic column is filled with the soil-profile image; do not print its URL. -->
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="144"/><xsl:with-param name="w" select="195"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="description"/><xsl:with-param name="align" select="'left'"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="341"/><xsl:with-param name="w" select="28"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="uscs"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="371"/><xsl:with-param name="w" select="31"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="spt"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="404"/><xsl:with-param name="w" select="32"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="drydensity"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="439"/><xsl:with-param name="w" select="32"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="moisturecontent"/></xsl:call-template>
        <xsl:call-template name="data-cell"><xsl:with-param name="x" select="474"/><xsl:with-param name="w" select="92.8"/><xsl:with-param name="y" select="$y"/><xsl:with-param name="value" select="remarks"/><xsl:with-param name="align" select="'left'"/></xsl:call-template>
    </xsl:template>
    <xsl:template name="data-cell"><xsl:param name="x"/><xsl:param name="w"/><xsl:param name="y"/><xsl:param name="value"/><xsl:param name="align" select="'center'"/>
        <xsl:if test="normalize-space($value)!=''">
            <fo:block-container absolute-position="absolute" left="{$x}pt" top="{$y}pt" width="{$w}pt" height="11pt" overflow="hidden">
                <fo:block font-family="Times New Roman" font-size="7pt" line-height="9pt" wrap-option="wrap" text-align="{$align}"><xsl:value-of select="$value"/></fo:block>
            </fo:block-container></xsl:if></xsl:template>
<!-- Render one boring. Caller provides the node resolved by boringid.
     The caller controls when the page count restarts, so Appendix A is A1 A2 ... -->
<xsl:template name="renderBoringLog">
    <xsl:param name="boring"/>
    <xsl:param name="appendix-letter" select="''"/>
    <xsl:param name="first-in-appendix" select="false()"/>
    <xsl:param name="section-id" select="''"/>
    <xsl:param name="appendix-id" select="''"/>
    <xsl:for-each select="$boring">
        <fo:page-sequence master-reference="boring-page" format="1" force-page-count="no-force">
            <xsl:attribute name="initial-page-number">
                <xsl:choose>
                    <xsl:when test="$first-in-appendix">1</xsl:when>
                    <xsl:otherwise>auto</xsl:otherwise>
                </xsl:choose>
            </xsl:attribute>
            <xsl:call-template name="boringHeader">
                <xsl:with-param name="appendix-letter" select="$appendix-letter"/>
            </xsl:call-template>
            <xsl:call-template name="boringFooter">
                <xsl:with-param name="appendix-letter" select="$appendix-letter"/>
            </xsl:call-template>
            <fo:flow flow-name="xsl-region-body">
                <!-- Destinations are shared with the original report TOC's generate-id() -->
                <xsl:if test="normalize-space($appendix-id) != ''">
                    <fo:block id="{$appendix-id}" font-size="0pt" line-height="0pt"/>
                </xsl:if>
                <xsl:if test="normalize-space($section-id) != '' and $section-id != $appendix-id">
                    <fo:block id="{$section-id}" font-size="0pt" line-height="0pt"/>
                </xsl:if>
                <xsl:choose>
                    <xsl:when test="samples/sample">
                        <xsl:call-template name="page">
                            <xsl:with-param name="page-start" select="0"/>
                            <xsl:with-param name="max-depth" select="number(samples/sample[last()]/depth)"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise><fo:block>No samples recorded.</fo:block></xsl:otherwise>
                </xsl:choose>
            </fo:flow>
        </fo:page-sequence>
    </xsl:for-each>
</xsl:template>
</xsl:stylesheet>
