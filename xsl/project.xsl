<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <fo:root>

      <!-- Page setup -->
      <fo:layout-master-set>
        <fo:simple-page-master master-name="A4"
          page-height="29.7cm" page-width="21cm" margin="2cm">
          <fo:region-body/>
        </fo:simple-page-master>
      </fo:layout-master-set>

      <fo:page-sequence master-reference="A4">
        <fo:flow flow-name="xsl-region-body">

          <!-- Title -->
          <fo:block font-size="18pt" font-weight="bold" text-align="center" margin-bottom="10pt">
            Project List
          </fo:block>

          <!-- Table -->
          <fo:table table-layout="fixed" width="100%" border-collapse="separate" border="0.5pt solid black">
            <fo:table-column column-width="5%"/>
            <fo:table-column column-width="10%"/>
            <fo:table-column column-width="10%"/>
            <fo:table-column column-width="15%"/>
            <fo:table-column column-width="10%"/>
            <fo:table-column column-width="15%"/>
            <fo:table-column column-width="25%"/>

            <!-- Table Header -->
            <fo:table-header>
              <fo:table-row background-color="#CCCCCC">
                <fo:table-cell><fo:block>Index</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Project ID</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Project Number</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Title</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Client</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Engineer</fo:block></fo:table-cell>
                <fo:table-cell><fo:block>Address</fo:block></fo:table-cell>
              </fo:table-row>
            </fo:table-header>

            <!-- Table Body -->
            <fo:table-body>
              <xsl:choose>
                <!-- If there are projects -->
                <xsl:when test="count(projects/project) &gt; 0">
                  <xsl:for-each select="projects/project">
                    <fo:table-row>
                      <fo:table-cell><fo:block><xsl:value-of select="position()"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="projectid"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="projectnumber"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="title"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="clientid"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="engineerid"/></fo:block></fo:table-cell>
                      <fo:table-cell><fo:block><xsl:value-of select="projectaddress"/></fo:block></fo:table-cell>
                    </fo:table-row>
                  </xsl:for-each>
                </xsl:when>

                <!-- If no projects, show a placeholder row -->
                <xsl:otherwise>
                  <fo:table-row>
                    <fo:table-cell number-columns-spanned="7">
                      <fo:block text-align="center" font-style="italic">No projects available</fo:block>
                    </fo:table-cell>
                  </fo:table-row>
                </xsl:otherwise>
              </xsl:choose>
            </fo:table-body>

          </fo:table>

        </fo:flow>
      </fo:page-sequence>

    </fo:root>
  </xsl:template>

</xsl:stylesheet>
