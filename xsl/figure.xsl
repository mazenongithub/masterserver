<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0">
    <xsl:output method="xml" encoding="UTF-8" indent="yes"/>
    <!--  GFK Figure Sheet: letter portrait/landscape, half-inch outer margin.
         All footer divisions use absolutely-positioned block containers,
         not nested tables. This fixes footer overflow past the outer frame.  -->
    <xsl:template match="/figure">
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
        <!--  Footer begins exactly 1.5in above the outer frame's bottom edge.  -->
        <xsl:variable name="footerTop">
            <xsl:choose>
                <xsl:when test="$orientation = 'landscape'">6.5in</xsl:when>
                <xsl:otherwise>9in</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!--  Row boundaries: +0.25in and +1.00in from footer top.  -->
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
        <!--  Column 1/2 split coordinates, relative to the full page.  -->
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
        <fo:root font-family="Times New Roman" font-size="12pt" color="#000000" font-weight="normal">
            <fo:layout-master-set>
                <fo:simple-page-master master-name="figure-portrait" page-width="8.5in" page-height="11in">
                    <fo:region-body margin="0in"/>
                </fo:simple-page-master>
                <fo:simple-page-master master-name="figure-landscape" page-width="11in" page-height="8.5in">
                    <fo:region-body margin="0in"/>
                </fo:simple-page-master>
            </fo:layout-master-set>
            <fo:page-sequence master-reference="figure-{$orientation}">
                <fo:flow flow-name="xsl-region-body">
                    <!--  Continuous outer border: 0.5in inside all page edges.  -->
                    <fo:block-container absolute-position="absolute" top="0.5in" left="0.5in" width="{$frameWidth}" height="{$frameHeight}" border="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <!--  Image fills most of the area above the fixed footer.  -->
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
                    <!--  Figure caption is above, not inside, the footer.  -->
                  
                    <!--  Fixed footer: 1.5in total = 0.25 + 0.75 + 0.5.
                         Draw rules separately to avoid table row minimum-height expansion.  -->
                    <fo:block-container absolute-position="absolute" top="{$footerTop}" left="0.5in" width="{$frameWidth}" height="0.01in" border-top="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <!--  50/50 division between company logo and title block.
                         Inset ~0.005in at either end so line cannot cross the frame.  -->
                    <fo:block-container absolute-position="absolute" top="{$footerTop}" left="{$rightStart}" width="0.01in" height="1.49in" border-left="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <!--  Left half logo: reserved full footer height.  -->
                    <fo:block-container absolute-position="absolute" top="{$footerTop}" left="0.62in" height="1.48in" display-align="center">
                        <xsl:attribute name="width">
                            <xsl:choose>
                                <xsl:when test="$orientation = 'landscape'">4.76in</xsl:when>
                                <xsl:otherwise>3.51in</xsl:otherwise>
                            </xsl:choose>
                        </xsl:attribute>
                        <fo:block text-align="center">
                            <xsl:choose>
                                <xsl:when test="normalize-space(logourl) != ''">
                                    <fo:external-graphic content-width="scale-to-fit" content-height="scale-to-fit" scaling="uniform" width="100%" height="1.28in">
                                        <xsl:attribute name="src">
                                            <xsl:text>url('</xsl:text>
                                            <xsl:value-of select="normalize-space(logourl)"/>
                                            <xsl:text>')</xsl:text>
                                        </xsl:attribute>
                                    </fo:external-graphic>
                                </xsl:when>
                                <xsl:otherwise>
                                    <fo:inline font-weight="normal" font-size="12pt">COMPANY LOGO</fo:inline>
                                </xsl:otherwise>
                            </xsl:choose>
                        </fo:block>
                    </fo:block-container>
                    <!--  Horizontal dividers within right half at 0.25in and 1.0in.  -->
                    <fo:block-container absolute-position="absolute" top="{$row2Top}" left="{$rightStart}" width="{$halfWidth}" height="0.01in" border-top="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$rightStart}" width="{$halfWidth}" height="0.01in" border-top="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <!--  ROW 1 (0.25in): figure title  -->
                    <fo:block-container absolute-position="absolute" top="{$footerTop}" left="{$rightStart}" width="{$halfWidth}" height="0.25in" display-align="center">
                        <fo:block font-size="14pt" font-weight="bold" line-height="16pt" text-align="center" margin-left="5pt" margin-right="5pt">
                            <xsl:value-of select="translate(figuretitle, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                        </fo:block>
                    </fo:block-container>
                    <!--  ROW 2 (0.75in): project title, address, city (three lines, 12pt / 14pt leading).  -->
                    <fo:block-container absolute-position="absolute" top="{$row2Top}" left="{$rightStart}" width="{$halfWidth}" height="0.75in" display-align="center">
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt" font-weight="normal">
                            <xsl:value-of select="projecttitle"/>
                        </fo:block>
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt">
                            <xsl:value-of select="projectaddress"/>
                        </fo:block>
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" margin-left="5pt" margin-right="5pt">
                            <xsl:value-of select="projectcity"/>
                        </fo:block>
                    </fo:block-container>
                    <!--  ROW 3 (0.5in): three fixed-width columns, no tables.  -->
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col2Start}" width="0.01in" height="0.49in" border-left="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col3Start}" width="0.01in" height="0.49in" border-left="0.75pt solid black">
                        <fo:block/>
                    </fo:block-container>
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$rightStart}" width="{$colWidth}" height="0.5in" display-align="center">
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="normal">Project No.</fo:block>
                        <fo:block text-align="center" font-size="12pt" line-height="14pt">
                            <xsl:value-of select="projectnumber"/>
                        </fo:block>
                    </fo:block-container>
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col2Start}" width="{$colWidth}" height="0.5in" display-align="center">
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="normal">Date</fo:block>
                        <fo:block text-align="center" font-size="12pt" line-height="14pt">
                            <!--  Empty until the figure is integrated into a report.  -->
                            <xsl:value-of select="reportdate"/>
                        </fo:block>
                    </fo:block-container>
                    <fo:block-container absolute-position="absolute" top="{$row3Top}" left="{$col3Start}" width="{$colWidth}" height="0.5in" display-align="center">
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="bold">PAGE</fo:block>
                        <fo:block text-align="center" font-size="12pt" line-height="14pt" font-weight="bold">
                            <fo:page-number/>
                        </fo:block>
                    </fo:block-container>
                    <!--  Required flowing block; all actual content is positioned.  -->
                    <fo:block/>
                </fo:flow>
            </fo:page-sequence>
        </fo:root>
    </xsl:template>
</xsl:stylesheet>