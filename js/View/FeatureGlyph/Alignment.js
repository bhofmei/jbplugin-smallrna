define("SmallRNAPlugin/View/FeatureGlyph/Alignment", [
        'dojo/_base/declare',
        'dojo/_base/array',
        'JBrowse/View/FeatureGlyph/Box',
        'JBrowse/Store/SeqFeature/_MismatchesMixin'
        ],
        function(
            declare,
            array,
            BoxGlyph,
            MismatchesMixin
        ) {

return declare( [BoxGlyph,MismatchesMixin], {

    constructor: function() {

        // if showMismatches is false, stub out this object's
        // _drawMismatches to be a no-op
        /*if( ! this.config.style.showMismatches )*/
        this._drawMismatches = function() {};

    },
    /* this function needs changed */
    _defaultConfig: function() {
        return this._mergeConfigs(
            dojo.clone( this.inherited(arguments) ),
            {
            //maxFeatureScreenDensity: 400
            style: {
                color: function( feature, path, glyph, track ) {
                    var strand = feature.get('strand');
                    var seqLen = feature.get('seq_length');
                    if(Math.abs(strand) != 1 && strand != '+' && strand != '-')
                        return glyph.getStyle( feature, '_color_other' );
                    else if(seqLen==21)
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_21') : glyph.getStyle(feature,'_color_21_rev');
                     else if(seqLen==22)
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_22') : glyph.getStyle(feature,'_color_22_rev');
                     else if(seqLen==23)
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_23') : glyph.getStyle(feature,'_color_23_rev');
                     else if(seqLen==24)
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_24') : glyph.getStyle(feature,'_color_24_rev');
                     else if(seqLen > 24 && seqLen < 32 && track.config.useMammal)
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_pi') : glyph.getStyle(feature,'_color_pi_rev');
                    else
                        return strand == 1 || strand == '+' ? glyph.getStyle(feature,'_color_other') : glyph.getStyle(feature,'_color_other_rev');
                },
                /* choose colors based on length and strand */
                _color_21: '#8BC240', // green
                _color_21_rev: 'rgba(139,194,64,0.5)',
                _color_22: '#3E98AF', // teal
                _color_22_rev:'rgba(62,152,175,0.5)',
                _color_23: '#A55EA4', // purple
                _color_23_rev: 'rgba(165,94,164,0.5)',
                _color_24: '#A94544', // red
                _color_24_rev: 'rgba(169,69,68,0.5)',
                _color_pi: '#F37A22', // orange
                _color_pi_rev: 'rgba(243,122,24,0.5)',
                _color_other: '#FDCB0A', // yellow
                _color_other_rev: 'rgba(253,203,10,0.5)',
                borderColor: null,
                strandArrow: true,

                height: 7,
                marginBottom: 1,
                showMismatches: false,
                mismatchFont: 'bold 10px Courier New,monospace'
            }
            }
        );
    },
    
    makeFeatureLabel: function( feature, fRect ) {
        var text = this.getFeatureLabel( feature );
        if( ! text )
            return null;
        text = text + ' bp';
        var font = this.getStyle( feature, 'textFont' );
        var l = fRect ? this.makeBottomOrTopLabel( text, font, fRect ) : this.makePopupLabel( text, font );
        l.fill = this.getStyle( feature, 'textColor' );
        return l;
    },

    renderFeature: function( context, fRect ) {

        this.inherited( arguments );

        // draw some mismatches if the feature is more than 3px wide:
        //     draw everything if zoomed in past 0.2 px/bp, otherwise
        //     draw only skips and deletions (the mismatches that
        //     might be large enough to see)
        if( fRect.w > 2 ) {
            if( fRect.viewInfo.scale > 0.2 )
                this._drawMismatches( context, fRect, this._getMismatches( fRect.f ) );
            else
                this._drawMismatches( context, fRect, this._getSkipsAndDeletions( fRect.f ));
        }
    },

    getCharacterMeasurements: function( context ) {
        return this.charSize = this.charSize || function() {
            var fpx;

            try {
                fpx = (this.config.style.mismatchFont.match(/(\d+)px/i)||[])[1];
            } catch(e) {}

            fpx = fpx || Infinity;
            return { w: fpx, h: fpx };
        }.call(this);
    }

});
});