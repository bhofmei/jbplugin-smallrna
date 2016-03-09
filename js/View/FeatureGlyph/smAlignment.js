define("SmallRNAPlugin/View/FeatureGlyph/smAlignment", [
        'dojo/_base/declare',
        'dojo/_base/array',
        'JBrowse/View/FeatureGlyph/Box',
        'JBrowse/View/FeatureGlyph/Alignment'
        ],
        function(
            declare,
            array,
            BoxGlyph,
            Alignment
        ) {

return declare( [Alignment], {

    constructor: function() {
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
                    var multimapping = feature.get('supplementary_alignment');
                    var seqLen = feature.get('seq_length');
                    if(Math.abs(strand) != 1 && strand != '+' && strand != '-')
                        return glyph.getStyle( feature, '_color_other' );
                    else if(seqLen==21)
                        return multimapping ? glyph.getStyle(feature,'_color_21_multi') : glyph.getStyle(feature,'_color_21');
                     else if(seqLen==22)
                        return multimapping ? glyph.getStyle(feature,'_color_22_multi') : glyph.getStyle(feature,'_color_22');
                     else if(seqLen==23)
                        return multimapping ? glyph.getStyle(feature,'_color_23_multi') : glyph.getStyle(feature,'_color_23');
                     else if(seqLen==24)
                        return multimapping ? glyph.getStyle(feature,'_color_24_multi') : glyph.getStyle(feature,'_color_24');
                     else if(seqLen > 25 && seqLen < 32 && track.config.isAnimal)
                        return multimapping ? glyph.getStyle(feature,'_color_pi_multi') : glyph.getStyle(feature,'_color_pi');
                    else
                        return multimapping ? glyph.getStyle(feature,'_color_other_multi') : glyph.getStyle(feature,'_color_other');
                },
                /* choose colors based on length and strand */
                _color_21: '#F37A22', // orange
                _color_21_multi: 'rgba(243,122,24,0.5)',
                _color_22: '#3E98AF', // teal
                _color_22_multi:'rgba(62,152,175,0.5)',
                _color_23: '#A55EA4', // purple
                _color_23_multi: 'rgba(165,94,164,0.5)',
                _color_24: '#A94544', // red
                _color_24_multi: 'rgba(169,69,68,0.5)',
                _color_pi: '#8BC240', // green
                _color_pi_multi: 'rgba(139,194,64,0.5)',
                _color_other: '#FDCB0A', // yellow
                _color_other_multi: 'rgba(253,203,10,0.5)',
                borderColor: null,
                strandArrow: true,

                height: 7,
                marginBottom: 0.5,
                showMismatches: false
            }
            }
        );
    },
    
    makeFeatureLabel: function( feature, fRect ) {
        var text = this.getFeatureLabel( feature );
        if( ! text )
            return null;
        else if(!isNaN(text))
            text = text + ' bp';
        var font = this.getStyle( feature, 'textFont' );
        var l = fRect ? this.makeBottomOrTopLabel( text, font, fRect ) : this.makePopupLabel( text, font );
        l.fill = this.getStyle( feature, 'textColor' );
        return l;
    }

});
});