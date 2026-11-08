<?xml version='1.0' encoding='UTF-8'?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" version="1.0"><xsl:output method="xml" encoding="UTF-8" indent="yes"/>
<xsl:include href="logdraft-common.xsl"/>
<xsl:template match="/log">
    <fo:root>
        <fo:layout-master-set>
            <xsl:call-template name="boring-page-master"/>
        </fo:layout-master-set>
        <xsl:call-template name="renderBoringLog">
            <xsl:with-param name="boring" select="boring"/>
            <xsl:with-param name="first-in-appendix" select="true()"/>
        </xsl:call-template>
    </fo:root>
</xsl:template></xsl:stylesheet>
