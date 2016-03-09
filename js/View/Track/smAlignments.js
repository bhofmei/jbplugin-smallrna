define( "SmallRNAPlugin/View/Track/smAlignments", [
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/promise/all',
            'JBrowse/Util',
            //'SmallRNAPlugin/View/Track/CanvasFeatures',
            'JBrowse/View/Track/CanvasFeatures',
            'SmallRNAPlugin/View/Track/_AlignmentsMixin'
        ],
        function(
            declare,
            array,
            all,
            Util,
            CanvasFeatureTrack,
            AlignmentsMixin
        ) {

return declare( [ CanvasFeatureTrack, AlignmentsMixin ], {
    
    constructor: function(arguments){
      /*this.config.isAnimal = true;
        if(typeof arguments.isAnimal != 'undefined' && !(arguments.isAnimal) ){
            this.config.isAnimal = false;
        }*/
    },

    _defaultConfig: function() {
        var c = Util.deepUpdate(
            dojo.clone( this.inherited(arguments) ),
            {
                glyph: 'SmallRNAPlugin/View/FeatureGlyph/smAlignment',
                maxFeatureGlyphExpansion: 0,
                maxFeatureScreenDensity: 6,

                /*hideDuplicateReads: true,
                hideQCFailingReads: true,
                hideSecondary: true,
                hideSupplementary: true,
                hideUnmapped: true,
                hideMissingMatepairs: false,*/
                hideMultiMappers: false,
                hideForwardStrand: false,
                hideReverseStrand: false,
                /*show21: true,
                show22: true,
                show23: true,
                show24: true,
                showpi: true,
                showOthers: true,*/
                hide21: false,
                hide22: false,
                hide23: false,
                hide24: false,
                hidepi: false,
                hideOthers: false,
                isAnimal: false,

                histograms: {
                    description: 'coverage depth',
                    binsPerBlock: 200
                },

                style: {
                    showLabels: false,
                    label: "seq_length",
                    description: false
                }
            }
        );
        return c;
    },

    _trackMenuOptions: function() {
        var track=this;
        var displayOptions=[];
        return all([ this.inherited(arguments),  this._alignmentsFilterTrackMenuOptions(), displayOptions ])
            .then( function( options ) {
                       var o = options.shift();
                       options.unshift({ type: 'dijit/MenuSeparator' } );
                       return o.concat.apply( o, options );
                   });
    }

});
});
